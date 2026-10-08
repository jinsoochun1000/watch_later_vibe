import java.sql.*;
import java.util.*;
import java.nio.file.*;
public class InspectOracle {
  public static void main(String[] args) throws Exception {
    var p = new Properties(); try(var in = Files.newInputStream(Path.of("backend/config/application-local.properties"))) { p.load(in); }
    try(var c = DriverManager.getConnection("jdbc:oracle:thin:@//192.168.45.2:1521/XEPDB1", "USERSTK9", p.getProperty("DB_PASSWORD")); var s = c.createStatement()) {
      try(var r = s.executeQuery("SELECT object_name, object_type, TO_CHAR(created, 'YYYY-MM-DD HH24:MI:SS') FROM user_objects WHERE object_name LIKE 'WL%' ORDER BY object_name")) { while(r.next()) System.out.println(r.getString(1) + " " + r.getString(2) + " " + r.getString(3)); }
      try(var r = s.executeQuery("SELECT table_name, column_name, data_type FROM user_tab_columns WHERE table_name IN ('WL_USERS', 'WL_POSTS') ORDER BY table_name, column_id")) { while(r.next()) System.out.println(r.getString(1) + " " + r.getString(2) + " " + r.getString(3)); }
    }
  }
}
