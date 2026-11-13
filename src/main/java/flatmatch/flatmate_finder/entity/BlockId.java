package flatmatch.flatmate_finder.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class BlockId implements Serializable {

    @Column(name = "blocker_id")
    private UUID blockerId;

    @Column(name = "blocked_id")
    private UUID blockedId;
}
