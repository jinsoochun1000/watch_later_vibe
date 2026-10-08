package kr.co.tkinfo.watchlater.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;

@Mapper
public interface PostMapper {
    Map<String, Object> getPostStatistics();
    int countByStatus(@Param("status") String status);
}
