package flatmatch.flatmate_finder.repository;

import flatmatch.flatmate_finder.entity.ExpenseSplit;
import flatmatch.flatmate_finder.entity.ExpenseSplitId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, ExpenseSplitId> {}
