package flatmatch.flatmate_finder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class OwnerSummary {
    UUID id;
    String name;
    boolean emailVerified;
}
