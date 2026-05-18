package com.xvet

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres
import liquibase.Liquibase
import liquibase.database.DatabaseFactory
import liquibase.database.jvm.JdbcConnection
import liquibase.resource.ClassLoaderResourceAccessor
import org.jooq.codegen.GenerationTool
import org.jooq.meta.jaxb.Configuration
import org.jooq.meta.jaxb.Database
import org.jooq.meta.jaxb.Generate
import org.jooq.meta.jaxb.Generator
import org.jooq.meta.jaxb.Jdbc
import org.jooq.meta.jaxb.Target
import javax.sql.DataSource

fun main() {
    val pg = EmbeddedPostgres.start()
    val dataSource = pg.getPostgresDatabase()
    applyMigrations(dataSource)
    val jdbcUrl = dataSource.connection.use { it.metaData.url }
    GenerationTool.generate(buildConfig(jdbcUrl))
    pg.close()
    println("jOOQ code generation complete!")
}

private fun applyMigrations(dataSource: DataSource) {
    dataSource.connection.use { conn ->
        val database =
            DatabaseFactory
                .getInstance()
                .findCorrectDatabaseImplementation(JdbcConnection(conn))
        val liquibase =
            Liquibase(
                "db/changelog/db.changelog-master.yaml",
                ClassLoaderResourceAccessor(),
                database,
            )
        liquibase.update("")
    }
}

private fun buildConfig(jdbcUrl: String) =
    Configuration()
        .withJdbc(
            Jdbc()
                .withDriver("org.postgresql.Driver")
                .withUrl(jdbcUrl)
                .withUser("postgres")
                .withPassword("postgres"),
        ).withGenerator(
            Generator()
                .withName("org.jooq.codegen.KotlinGenerator")
                .withDatabase(buildDatabase())
                .withGenerate(buildGenerate())
                .withTarget(
                    Target()
                        .withPackageName("com.xvet.jooq")
                        .withDirectory("src/generated/jooq"),
                ),
        )

private fun buildDatabase() =
    Database()
        .withName("org.jooq.meta.postgres.PostgresDatabase")
        .withInputSchema("public")
        .withExcludes("databasechangelog|databasechangeloglock")

private fun buildGenerate() =
    Generate()
        .withDeprecated(false)
        .withRecords(true)
        .withImmutablePojos(true)
        .withFluentSetters(true)
