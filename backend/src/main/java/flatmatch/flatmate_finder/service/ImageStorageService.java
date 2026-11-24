package flatmatch.flatmate_finder.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import flatmatch.flatmate_finder.dto.StoredImage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageStorageService {


    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private final Cloudinary cloudinary;

    /** Validates every file first, so a bad request never leaves half a batch uploaded. */
    public List<StoredImage> uploadAll(List<MultipartFile> files, String folder) {
        files.forEach(this::validate);

        List<StoredImage> stored = new ArrayList<>();
        try {
            for (MultipartFile file : files) {
                stored.add(upload(file, folder));
            }
        } catch (RuntimeException e) {
            deleteQuietly(stored.stream().map(StoredImage::getPublicId).toList());
            throw e;
        }
        return stored;
    }

    public void deleteQuietly(Collection<String> publicIds) {
        for (String id : publicIds) {
            if (id == null) continue;
            try {
                cloudinary.uploader().destroy(id, ObjectUtils.emptyMap());
            } catch (Exception e) {
                log.warn("Could not delete Cloudinary image {}", id, e);
            }
        }
    }

    private StoredImage upload(MultipartFile file, String folder) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "allowed_formats", "jpg,png,webp",
                    // shrink huge phone photos to at most 1600 px to save storage and bandwidth
                    "transformation", new Transformation().width(1600).height(1600).crop("limit")));
            return new StoredImage((String) result.get("secure_url"), (String) result.get("public_id"));
        } catch (IOException e) {
            log.error("Cloudinary upload failed", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Image upload failed. Please try again.");
        }
    }

    private void validate(MultipartFile file) {
        if (file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Each photo must be 5 MB or smaller");
        }
        // check the real file header, because the Content-Type header can be faked
        try (InputStream in = file.getInputStream()) {
            byte[] head = in.readNBytes(12);
            if (!looksLikeSupportedImage(head)) {
                throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                        "Only JPEG, PNG or WebP images are allowed");
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read the uploaded file");
        }
    }

    private static boolean looksLikeSupportedImage(byte[] h) {
        if (h.length >= 3 && (h[0] & 0xFF) == 0xFF && (h[1] & 0xFF) == 0xD8 && (h[2] & 0xFF) == 0xFF) {
            return true;                                   // JPEG
        }
        if (h.length >= 4 && (h[0] & 0xFF) == 0x89 && h[1] == 'P' && h[2] == 'N' && h[3] == 'G') {
            return true;                                   // PNG
        }
        return h.length >= 12 && h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F'
                && h[8] == 'W' && h[9] == 'E' && h[10] == 'B' && h[11] == 'P';   // WebP
    }
}