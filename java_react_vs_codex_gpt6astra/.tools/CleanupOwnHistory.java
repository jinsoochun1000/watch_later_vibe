import java.sql.*;
import java.util.*;
import java.nio.file.*;
public class CleanupOwnHistory {
  public static void main(String[] args) throws Exception {
    var p = new Properties(); try(var in = Files.newInputStream(Path.of("backend/config/application-local.properties"))) { p.load(in); }
    try(var c = DriverManager.getConnection("jdbc:oracle:thin:@//192.168.45.2:1521/XEPDB1", "USERSTK9", p.getProperty("DB_PASSWORD")); var s = c.createStatement()) {
      try(var r = s.executeQuery("SELECT TO_CHAR(created, 'YYYY-MM-DD HH24:MI:SS') FROM user_objects WHERE object_name='WL_FLYWAY_HISTORY' AND object_type='TABLE'")) {
        if(!r.next() || !"2026-10-08 10:40:13".equals(r.getString(1))) throw new IllegalStateException("Not the history table created in this session");
      }
      s.execute("DROP TABLE WL_FLYWAY_HISTORY");
      System.out.println("Removed only the failed Flyway history created by this session; existing tables preserved.");
    }
  }
}
