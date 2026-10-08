import java.sql.*;
import java.nio.file.*;
import java.util.Properties;

/** Read-only schema diagnostics. Run from backend with the Oracle JDBC jar on the classpath. */
class InspectDatabase {
    public static void main(String[] args) throws Exception {
        Properties local = new Properties();
        try (var reader = Files.newBufferedReader(Path.of("application-local.properties"))) { local.load(reader); }
        try (var db = DriverManager.getConnection("jdbc:oracle:thin:@//192.168.45.2:1521/XEPDB1", "USERSTK9", local.getProperty("DB_PASSWORD"));
             var query = db.createStatement()) {
            try (var rows = query.executeQuery("SELECT OBJECT_NAME, OBJECT_TYPE FROM USER_OBJECTS WHERE OBJECT_NAME LIKE 'WL\\_%' ESCAPE '\\' ORDER BY OBJECT_NAME")) {
                while (rows.next()) System.out.println(rows.getString(1) + " " + rows.getString(2));
            }
            try (var rows = query.executeQuery("SELECT \"version\", \"description\", \"success\" FROM WL_ASTRA_SCHEMA_HISTORY")) {
                while (rows.next()) System.out.println("app history: " + rows.getString(1) + " " + rows.getString(2) + " " + rows.getString(3));
            }
        }
    }
}
