package hackathon.poolmeup;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.database.Cursor;
import android.provider.ContactsContract;
import android.telephony.TelephonyManager;
import android.util.Log;

/**
 * @author Guy Vider
 *
 */
public class MyPhoneNumberPlugin extends CordovaPlugin {
	
	private void log(String message){
		Log.d("MyPhoneNumberPlugin", message);
	}
	
	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
			log("*******************");
			JSONObject result = new JSONObject();
			result.put("phoneNumber", "999999!");
			callbackContext.success(result);
			
			
			Cursor c = cordova.getActivity().getContentResolver().query(ContactsContract.Profile.CONTENT_URI, null, null, null, null);
			int count = c.getCount();
			String[] columnNames = c.getColumnNames();
			boolean b = c.moveToFirst();
			int position = c.getPosition();
			if (count == 1 && position == 0) {
				log("########");
			    for (int j = 0; j < columnNames.length; j++) {
			        String columnName = columnNames[j];
			        String columnValue = c.getString(c.getColumnIndex(columnName));
			        
			        log(columnName + "==>" + columnValue);
			        // consume the values here
			    }
			    log("----");
			    
			    TelephonyManager cel = (TelephonyManager) cordova.getActivity().getApplicationContext().getSystemService(Context.TELEPHONY_SERVICE);
			    
			    System.out.println(cel.getDeviceSoftwareVersion());
			    System.out.println(cel.getLine1Number());
			    System.out.println(cel.getNetworkCountryIso());
			    System.out.println(cel.getVoiceMailAlphaTag());
			    System.out.println(cel.getVoiceMailNumber());
			    
			    log("########");
			}
			c.close();
			
			return true;
	}

//	@Override
//	public PluginResult execute(String action, JSONArray data, String callbackId) {
//		Log.d("MyPhoneNumberPlugin", "Plugin called");
//		PluginResult result = null;
//		try {
//			JSONObject number = getMyPhoneNumber();
//			Log.d("MyPhoneNumberPlugin", "Returning "+ number.toString());
//			result = new PluginResult(Status.OK, number);
//		}
//		catch (Exception ex) {
//			Log.d("MyPhoneNumberPlugin", "Got Exception "+ ex.getMessage());
//			result = new PluginResult(Status.ERROR);
//		}
//		return result;
//	}
//	
//	private void log(String message){
//		Log.d("MyPhoneNumberPlugin", message);
//	}
//
//	private JSONObject getMyPhoneNumber() throws JSONException {
//		Log.d("MyPhoneNumberPlugin", "at getMyPhoneNumber");
//		JSONObject result = new JSONObject();
//		
//		log("*******************");
//		
//		Cursor c = activity.getContentResolver().query(ContactsContract.Profile.CONTENT_URI, null, null, null, null);
//		int count = c.getCount();
//		String[] columnNames = c.getColumnNames();
//		boolean b = c.moveToFirst();
//		int position = c.getPosition();
//		if (count == 1 && position == 0) {
//		    for (int j = 0; j < columnNames.length; j++) {
//		        String columnName = columnNames[j];
//		        String columnValue = c.getString(c.getColumnIndex(columnName)));
//		        ...
//		        // consume the values here
//		    }
//		}
//		c.close();
//		
//		log("*******************");
//		
////		TelephonyManager tm = (TelephonyManager) ctx.getSystemService(Context.TELEPHONY_SERVICE);
////        String number = tm.getLine1Number();
////        if(number.equals("") || number == null) {
////        	Log.d("MyPhoneNumberPlugin", "We're on a non-phone device. Returning a hash of the UDID");
////        	number = md5(tm.getDeviceId()).substring(0, 10);
////        }
////        Log.d("MyPhoneNumberPlugin", "Phone number=" + number);
//        result.put("phoneNumber", number);
//		return result;
//	}
//	
//	private String md5(String s) {
//	    try {
//	        // Create MD5 Hash
//	        MessageDigest digest = java.security.MessageDigest.getInstance("MD5");
//	        digest.update(s.getBytes());
//	        byte messageDigest[] = digest.digest();
//	        
//	        // Create Hex String
//	        StringBuffer hexString = new StringBuffer();
//	        for (int i=0; i<messageDigest.length; i++)
//	            hexString.append(Integer.toHexString(0xFF & messageDigest[i]));
//	        return hexString.toString();
//	        
//	    } catch (NoSuchAlgorithmException e) {
//	    	Log.d("MyPhoneNumberPlugin", e.getMessage());
//	    }
//	    return "";
//	}
}
