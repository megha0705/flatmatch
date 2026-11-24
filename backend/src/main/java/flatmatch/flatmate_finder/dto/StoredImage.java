package flatmatch.flatmate_finder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StoredImage {

    private final String url;
    private final String publicId;
}