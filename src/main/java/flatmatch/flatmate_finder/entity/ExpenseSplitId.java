package flatmatch.flatmate_finder.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class ExpenseSplitId implements Serializable {

    @Column(name = "expense_id")
    private UUID expenseId;

    @Column(name = "user_id")
    private UUID userId;
}
