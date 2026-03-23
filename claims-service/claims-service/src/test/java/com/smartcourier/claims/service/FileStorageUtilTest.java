package com.smartcourier.claims.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class FileStorageUtilTest {

    private FileStorageUtil fileStorageUtil;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        fileStorageUtil = new FileStorageUtil();
        ReflectionTestUtils.setField(fileStorageUtil, "UPLOAD_DIR", tempDir.toString());
    }

    @Test
    void storeFile_Success() {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "content".getBytes());
        String path = fileStorageUtil.storeFile(file, "testuser");

        assertNotNull(path);
        assertTrue(new File(path).exists());
    }

    @Test
    void storeFile_EmptyFile_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile("file", "", "text/plain", new byte[0]);
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            fileStorageUtil.storeFile(file, "testuser");
        });

        assertEquals("Failed to store empty file", ex.getMessage());
    }
}
