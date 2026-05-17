package com.xvet.auth

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.jdbc.support.GeneratedKeyHolder
import org.springframework.stereotype.Repository

@Repository
class UserRepository(
    private val jdbc: NamedParameterJdbcTemplate,
) {
    fun save(user: UserEntity): UserEntity {
        val keyHolder = GeneratedKeyHolder()
        jdbc.update(
            """
            INSERT INTO users (email, password, first_name, last_name, role)
            VALUES (:email, :password, :firstName, :lastName, :role::user_role)
            """,
            MapSqlParameterSource()
                .addValue("email", user.email)
                .addValue("password", user.password)
                .addValue("firstName", user.firstName)
                .addValue("lastName", user.lastName)
                .addValue("role", user.role.name),
            keyHolder,
            arrayOf("id", "created_at", "updated_at"),
        )
        return user.copy(
            id = keyHolder.keys!!["id"] as Long,
            createdAt = keyHolder.keys!!["created_at"] as java.time.LocalDateTime,
            updatedAt = keyHolder.keys!!["updated_at"] as java.time.LocalDateTime,
        )
    }

    fun findByEmail(email: String): UserEntity? {
        val users =
            jdbc.query(
                "SELECT * FROM users WHERE email = :email",
                MapSqlParameterSource("email", email),
            ) { rs, _ ->
                UserEntity(
                    id = rs.getLong("id"),
                    email = rs.getString("email"),
                    password = rs.getString("password"),
                    firstName = rs.getString("first_name"),
                    lastName = rs.getString("last_name"),
                    role = UserRole.valueOf(rs.getString("role")),
                    createdAt = rs.getTimestamp("created_at").toLocalDateTime(),
                    updatedAt = rs.getTimestamp("updated_at").toLocalDateTime(),
                )
            }
        return users.firstOrNull()
    }

    fun existsByEmail(email: String): Boolean {
        val count =
            jdbc.queryForObject(
                "SELECT COUNT(*) FROM users WHERE email = :email",
                MapSqlParameterSource("email", email),
                Long::class.java,
            )
        return count != null && count > 0
    }
}
