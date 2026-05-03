package com.smartcourier.claims.service;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
public class FileStorageUtil {

    private final String UPLOAD_DIR = "/app/uploads";

    public FileStorageUtil() {
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }

    public String storeFile(MultipartFile file, String username) {
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file");
        }

        try {
            String fileName = username + "_" + UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path targetLocation = Paths.get(UPLOAD_DIR).resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return targetLocation.toString();
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }
}
