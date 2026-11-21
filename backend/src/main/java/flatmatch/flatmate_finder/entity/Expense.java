package flatmatch.flatmate_finder.entity;

import flatmatch.flatmate_finder.entity.enums.ExpenseCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static jakarta.persistence.EnumType.STRING;
import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name = "expenses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Expense extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "household_id")
    private Household household;

    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "paid_by")
    private User paidBy;

    // amount in paise (INR x 100)
    @Column(name = "amount_paise", nullable = false)
    private Long amountPaise;

    @Column(name = "description", nullable = false)
    private String description;

    @Enumerated(STRING)
    @Column(name = "category", nullable = false)
    @Builder.Default
    private ExpenseCategory category = ExpenseCategory.OTHER;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExpenseSplit> splits = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public void addSplit(User user, long sharePaise) {
        splits.add(new ExpenseSplit(this, user, sharePaise));
    }
}
