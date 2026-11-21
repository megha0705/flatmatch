package flatmatch.flatmate_finder.repository;
import flatmatch.flatmate_finder.entity.Block;
import flatmatch.flatmate_finder.entity.BlockId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface BlockRepository extends JpaRepository<Block, BlockId> {
    @Query("select count(b) > 0 from Block b where "
         + "(b.id.blockerId = :a and b.id.blockedId = :b) or "
         + "(b.id.blockerId = :b and b.id.blockedId = :a)")
    boolean existsBetween(@Param("a") UUID a, @Param("b") UUID b);
}
