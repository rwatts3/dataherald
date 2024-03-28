# Datanase Migration with Liquibase

## Standard Liquibase workflow
![alt text](https://docs.liquibase.com/z_resources/images/how-liquibase-works-general.jpg)
The important files are `changelog.yaml` and `liquibase.properties`. All other files are autogenerated by liquibase for examples.

## Install Liquibase
Follow the instructions [here](https://www.liquibase.com/download) to install the Liquibase CLI tool to your local machine

## Changelog File
![alt text](https://docs.liquibase.com/z_resources/images/changelog-structure.png)
We use `changelog.yaml` to add database changes in sequential order.

Database changes have the format of [changesets](https://docs.liquibase.com/concepts/changelogs/changeset.html). Changesets contain [Change Types](https://docs.liquibase.com/change-types/home.html), which are types of operations to apply to the database, such as adding a column or primary key. [Context](https://docs.liquibase.com/concepts/changelogs/attributes/contexts.html), [label](https://docs.liquibase.com/concepts/changelogs/attributes/labels.html), and [precondition](https://docs.liquibase.com/concepts/changelogs/preconditions.html) changelog tags help precisely control when a database change is made and to which database environment it is deployed.

## Properties File
To set the connection between Liquibase with your database, you need the [database connection information](https://docs.liquibase.com/start/tutorials/home.html) and parameters. Liquibase includes a [properties file](https://docs.liquibase.com/concepts/connections/creating-config-properties.html) to store database connection information and parameters that rarely change. Setting the parameters as [environment variables](https://docs.liquibase.com/concepts/connections/liquibase-environment-variables.html) to handle sensitive database information or running them at the command prompt is an alternative option.

## Liquibase with MongoDB
Use this [documentation](https://contribute.liquibase.com/extensions-integrations/directory/database-tutorials/mongodb/) on how to use Liquibase MongoDB locally and how to write `changelog` files for mongoDB.

To run specified mongodb commands, use `runCommand` in the changelog. Checkout out the documentation for mongodb commands [here](https://www.mongodb.com/docs/manual/reference/command/#std-label-database-commands).

## Liquibase commands
Liquibase runs six basic types of [commands](https://docs.liquibase.com/commands/home.html): update, rollback, snapshot, diff, status, and utility commands. When you use the update command to deploy your first changes, Liquibase checks the database connection information, including credentials, database URL, and JDBC driver.

## Database Changelog and Database Changelog Lock
When you deploy your changes, Liquibase creates two tables in your database: [DATABASECHANGELOG](https://docs.liquibase.com/concepts/tracking-tables/databasechangelog-table.html) and [DATABASECHANGELOGLOCK](https://docs.liquibase.com/concepts/tracking-tables/databasechangeloglock-table.html).

The DATABASECHANGELOG table tracks deployed changes so that you have a record. Liquibase compares the changesets in the changelog file with the DATABASECHANGELOG tracking table and deploys only new changesets.

DATABASECHANGELOGLOCK prevents multiple instances of Liquibase from updating the database at the same time. The table manages access to the DATABASECHANGELOG table during deployment and ensures only one instance of Liquibase is updating the database.

## Flow Files
Liquibase Flow Files let you create portable, platform-independent Liquibase workflows that can run anywhere without modification. This includes Jenkins, GitHub actions, a developers desktop, or any other CI/CD support tool. Flow Files are available in Liquibase 4.15.0 and later.

We currently don't use flow files.

To learn more about flow files, checkout this [documentation](https://docs.liquibase.com/commands/flow/home.html).