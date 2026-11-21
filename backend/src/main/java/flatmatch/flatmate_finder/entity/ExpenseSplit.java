package flatmatch.flatmate_finder.entity;

import jakarta.persistence.*;
import lombok.*;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name = "expense_splits")
@Getter @Setter @NoArgsConstructor
public class ExpenseSplit extends BaseEntity {

    @EmbeddedId
    private ExpenseSplitId id;

    @MapsId("expenseId")
    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "expense_id")
    private Expense expense;

    @MapsId("userId")
    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "share_paise", nullable = false)
    private Long sharePaise;

    public ExpenseSplit(Expense expense, User user, long sharePaise) {
        this.id = new ExpenseSplitId(expense.getId(), user.getId());
        this.expense = expense;
        this.user = user;
        this.sharePaise = sharePaise;
    }
}
