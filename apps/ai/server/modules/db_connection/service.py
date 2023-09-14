import httpx
from bson import ObjectId
from fastapi import HTTPException, UploadFile, status

from config import settings
from modules.db_connection.models.entities import DBConnection, DBConnectionRef
from modules.db_connection.models.requests import DBConnectionRequest
from modules.db_connection.models.responses import DBConnectionResponse
from modules.db_connection.repository import DatabaseRepository
from modules.organization.service import OrganizationService
from utils.s3 import S3


class DatabaseService:
    def __init__(self):
        self.repo = DatabaseRepository()
        self.org_service = OrganizationService()

    async def get_db_connections(self, org_id: str) -> list[DBConnectionResponse]:
        db_connection_refs = self.repo.get_db_connection_refs(org_id)
        db_connection_ids = [
            str(db_connection_ref.db_connection_id)
            for db_connection_ref in db_connection_refs
        ]
        db_connections = self.repo.get_db_connections(db_connection_ids)
        return [
            self._get_mapped_db_connection_response(db_connection)
            for db_connection in db_connections
        ]

    async def get_db_connection(self, db_connection_id: str) -> DBConnectionResponse:
        db_connection = self.repo.get_db_connection(db_connection_id)
        return (
            self._get_mapped_db_connection_response(db_connection)
            if db_connection
            else None
        )

    async def add_db_connection(
        self,
        db_connection_request_json: dict,
        org_id: str,
        file: UploadFile = None,
    ) -> DBConnectionResponse:
        db_connection_request = DBConnectionRequest(**db_connection_request_json)

        if file:
            s3 = S3()
            db_connection_request.path_to_credentials_file = s3.upload(file)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.k2_core_url + "/database-connections",
                json=db_connection_request.dict(),
            )

            if response.status_code != status.HTTP_200_OK:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail=response.json()
                )

            response_json = response.json()
            db_connection = DBConnection(**response_json)
            db_connection.id = ObjectId(response_json["id"])
            self.repo.add_db_connection_ref(
                DBConnectionRef(
                    alias=db_connection_request.alias,
                    db_connection_id=ObjectId(db_connection.id),
                    organization_id=ObjectId(org_id),
                ).dict(exclude={"id"})
            )

            self.org_service.update_organization(
                org_id, {"db_connection_id": db_connection.id}
            )

            return True

    async def update_db_connection(
        self, db_connection_id, db_connection_request: DBConnectionRequest
    ) -> DBConnectionResponse:
        pass

    async def _get_mapped_db_connection_response(
        self, db_connection: DBConnection
    ) -> DBConnectionResponse:
        db_connection_response = DBConnectionResponse(**db_connection.dict())
        db_connection_response.id = str(db_connection_response.id)
        return db_connection_response