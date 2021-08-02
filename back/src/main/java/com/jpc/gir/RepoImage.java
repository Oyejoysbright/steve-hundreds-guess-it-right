package com.jpc.gir;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoImage extends JpaRepository<Image, Integer> {
    @Query(value = "ALTER TABLE image ALTER COLUMN id RESTART WITH 1", nativeQuery = true)
    void resetId();

    @Modifying
    @Query(value = "TRUNCATE TABLE image", nativeQuery = true)
    void truncate();
}
