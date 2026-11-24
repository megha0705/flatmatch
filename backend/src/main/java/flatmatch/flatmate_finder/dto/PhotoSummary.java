package flatmatch.flatmate_finder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;
@Getter
@AllArgsConstructor
public class PhotoSummary {
    UUID id;
    String url;
    Short position;
}
