package kr.co.tkinfo.watchlater;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.ConstructorArgs;
import org.apache.ibatis.annotations.Arg;

@Mapper
public interface PostStatsMapper {
    record Stats(long total, long newCount, long doneCount) {}
    @Select("SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN STATUS = 'NEW' THEN 1 ELSE 0 END),0) AS newCount, COALESCE(SUM(CASE WHEN STATUS = 'DONE' THEN 1 ELSE 0 END),0) AS doneCount FROM WL_ASTRA_POSTS")
    @ConstructorArgs({@Arg(column="total", javaType=long.class), @Arg(column="newCount", javaType=long.class), @Arg(column="doneCount", javaType=long.class)})
    Stats stats();
}
