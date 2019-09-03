import java.util.*;

import javax.xml.bind.*;
import org.json.*;

public class JDBCConnection {
	
	public static JSONObject toJSON(HashMap <String,List<String>> object) throws JAXBException,JSONException {	    
        JSONObject json = new JSONObject();       
        for (Object key : object.keySet()) {
        	JSONArray NWjson = new JSONArray();
	        for (String strs : object.get(key)) {
	            NWjson.put(strs);
	        }  
            json.put(key.toString(), NWjson);
        }
        return json;
	}
	
	public static void main(String args[]){
		if(args.length == 5){			
			try{
				//JDBCHandler handler = new JDBCHandler("apollo", "1521", "c02457555b", "c02457555", "PDB01");
				JDBCHandler handler = new JDBCHandler(args[0], args[1], args[2], args[3], args[4]);
				
				//List<String> Folder = new ArrayList<String>();
				HashMap <String,List<String>> map = new HashMap <String,List<String>>();
				
				List<String> Folder = handler.ExecuteAndFetchCol("SELECT SUBJ_NAME FOLDER FROM OPB_SUBJECT", "FOLDER");
				
				for(String fldr:Folder){
					List<String> mappings = handler.ExecuteAndFetchCol("SELECT MAPPING_NAME FROM OPB_SUBJECT,OPB_MAPPING WHERE SUBJ_ID=SUBJECT_ID AND IS_VISIBLE=1 AND SUBJ_NAME LIKE '"+fldr+"'", "MAPPING_NAME");
					map.put(fldr, mappings);
				}							
			
				JSONObject json = toJSON(map);
				System.out.println(json.toString(1));
			}
			catch(Exception e){
				//e.printStackTrace();
			}	
		}
	}
}
