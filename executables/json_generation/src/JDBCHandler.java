import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class JDBCHandler {
	
	    //INIT JDBCHandler handler = new JDBCHandler("apollo", "1521", "c02457555b", "c02457555", "PDB01");
	
		Connection conn;
		public  JDBCHandler(String hostname,String port, String username, String password, String service){
			try{
				Class.forName("oracle.jdbc.driver.OracleDriver");
				conn = DriverManager.getConnection(  
						"jdbc:oracle:thin:@//"+hostname+":"+port+"/"+service,username,password);
				
			}
			catch(Exception e){
				e.printStackTrace();
			}
		}
		
		public List<String> ExecuteAndFetchCol(String query,String col) throws SQLException{
			
			List <String> result = new ArrayList<String>();
			
			Statement stm = conn.createStatement();
			ResultSet rs  = stm.executeQuery(query);
			while (rs.next()) {
				result.add(rs.getString(col));
			}
			rs.close();
			stm.close();
			return  result;
			/*  usage
			 * 	List<String> strs = handler.ExecuteAndFetchCol("SELECT * FROM OPB_ATTR ","ATTR_NAME");
			 *	System.out.println(strs.size());
			
			 *	strs = handler.ExecuteAndFetchCol("SELECT * FROM OPB_ATTR WHERE ATTR_SIBLING=10 ","ATTR_NAME");
			 *	System.out.println(strs.size());
			 */
		}
	

}
