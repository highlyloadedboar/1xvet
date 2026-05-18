package com.xvet.auth

import com.xvet.jooq.tables.references.USERS
import org.jooq.DSLContext
import org.springframework.stereotype.Repository
import com.xvet.jooq.enums.UserRole as JooqUserRole

@Repository
class UserRepository(
    private val dsl: DSLContext,
) {
    fun save(user: UserEntity): UserEntity {
        val record =
            dsl
                .insertInto(USERS)
                .set(USERS.EMAIL, user.email)
                .set(USERS.PASSWORD, user.password)
                .set(USERS.FIRST_NAME, user.firstName)
                .set(USERS.LAST_NAME, user.lastName)
                .set(USERS.ROLE, JooqUserRole.valueOf(user.role.name))
                .returning()
                .fetchOne()!!

        return record.toEntity()
    }

    fun findByEmail(email: String): UserEntity? =
        dsl
            .selectFrom(USERS)
            .where(USERS.EMAIL.eq(email))
            .fetchOne()
            ?.toEntity()

    fun existsByEmail(email: String): Boolean =
        dsl.fetchExists(
            dsl.selectFrom(USERS).where(USERS.EMAIL.eq(email)),
        )

    private fun org.jooq.Record.toEntity() =
        UserEntity(
            id = get(USERS.ID)!!,
            email = get(USERS.EMAIL)!!,
            password = get(USERS.PASSWORD)!!,
            firstName = get(USERS.FIRST_NAME)!!,
            lastName = get(USERS.LAST_NAME)!!,
            role = UserRole.valueOf(get(USERS.ROLE)!!.name),
            createdAt = get(USERS.CREATED_AT)!!,
            updatedAt = get(USERS.UPDATED_AT)!!,
        )
}
