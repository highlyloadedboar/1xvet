package com.xvet.pet

import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.jdbc.support.GeneratedKeyHolder
import org.springframework.stereotype.Repository

@Repository
class PetRepository(
    private val jdbc: NamedParameterJdbcTemplate,
) {
    private val rowMapper =
        RowMapper { rs, _ ->
            PetEntity(
                id = rs.getLong("id"),
                ownerId = rs.getLong("owner_id"),
                name = rs.getString("name"),
                species = PetSpecies.valueOf(rs.getString("species")),
                breed = rs.getString("breed"),
                birthDate = rs.getDate("birth_date")?.toLocalDate(),
                weight = rs.getObject("weight") as? Double,
                createdAt = rs.getTimestamp("created_at").toLocalDateTime(),
                updatedAt = rs.getTimestamp("updated_at").toLocalDateTime(),
            )
        }

    fun save(pet: PetEntity): PetEntity {
        val keyHolder = GeneratedKeyHolder()
        jdbc.update(
            """
            INSERT INTO pets (owner_id, name, species, breed, birth_date, weight)
            VALUES (:ownerId, :name, :species::pet_species, :breed, :birthDate, :weight)
            """,
            MapSqlParameterSource()
                .addValue("ownerId", pet.ownerId)
                .addValue("name", pet.name)
                .addValue("species", pet.species.name)
                .addValue("breed", pet.breed)
                .addValue("birthDate", pet.birthDate)
                .addValue("weight", pet.weight),
            keyHolder,
            arrayOf("id", "created_at", "updated_at"),
        )
        val keys = keyHolder.keys!!
        return pet.copy(
            id = keys["id"] as Long,
            createdAt = (keys["created_at"] as java.sql.Timestamp).toLocalDateTime(),
            updatedAt = (keys["updated_at"] as java.sql.Timestamp).toLocalDateTime(),
        )
    }

    fun findByOwnerId(ownerId: Long): List<PetEntity> =
        jdbc.query(
            "SELECT * FROM pets WHERE owner_id = :ownerId ORDER BY created_at DESC",
            MapSqlParameterSource("ownerId", ownerId),
            rowMapper,
        )

    fun findById(id: Long): PetEntity? =
        jdbc
            .query(
                "SELECT * FROM pets WHERE id = :id",
                MapSqlParameterSource("id", id),
                rowMapper,
            ).firstOrNull()

    fun update(pet: PetEntity): PetEntity {
        jdbc.update(
            """
            UPDATE pets SET name = :name, species = :species::pet_species,
                breed = :breed, birth_date = :birthDate, weight = :weight,
                updated_at = NOW()
            WHERE id = :id
            """,
            MapSqlParameterSource()
                .addValue("id", pet.id)
                .addValue("name", pet.name)
                .addValue("species", pet.species.name)
                .addValue("breed", pet.breed)
                .addValue("birthDate", pet.birthDate)
                .addValue("weight", pet.weight),
        )
        return findById(pet.id)!!
    }

    fun deleteById(id: Long) {
        jdbc.update(
            "DELETE FROM pets WHERE id = :id",
            MapSqlParameterSource("id", id),
        )
    }
}
