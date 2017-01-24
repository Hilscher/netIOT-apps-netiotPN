netIOT PROFINET App
=======

General
-----------
This software is to create a mobile application and was created with Microsoft Visual Studio Professional 2015 (V14.0.23107.178) and Microsoft Visual Studio Tools for Apache Cordova (V14.0.60401.1).

The file ".\ProfinetApp\www\indexWeb.html" can be directly in Firefox (V47.0 or above) opened, but all functionalities of cordova plugins can not be used.

License
-----------
This software is Licensed under MIT License.

This software uses the following open source code:

  * Cordova Certificate Plugin V0.6.4 (Licensed under MIT)
  * Cordova InAppBrowser Plugin V1.4.0 (Licensed under Apache 2.0)
  * Cordova Network Whitelist Plugin V1.2.2 (Licensed under Apache 2.0)
  * Custom URL scheme V4.1.5 (Licensed under MIT)
  * OpenUI5 V1.36.10 (Licensed under Apache 2.0)
  
Test
-----------
Test steps:

1. Press button with list icon on the top right corner of the start page.

2. Select Login menu item.

3. Add a new server in server page and fill the followings: 
  For online Test: 
   Server name: Hilscher Online Starterkit (Not important)
   Server URL: https://starterkit.netiot.com
   User name:  {request from Hilscher}
   Password:  {request from Hilscher}

  For local Starterkit test with WiFi connection:
   Server name: Local Starterkit (Not important)
   Server URL:  {Local host address, e.g.  https//192.168.10.1 }
   User name:   {user name of your starter kit}
   Password:    {password of your starter kit}

4. Save these information, go back to Login page and select the server which is defined above.

5. Press login button and login with the selected server.

6. If it is successfully logged, a green accept icon will be shown.

7. Go back to start page and press the button with list icon on the top right corner again. Select the Device list menu item, a dialog will pop up.

8. In the device list dialog, select one device and press OK button.

9. The dialog will be closed and the details of the seleted device will be shown.

10. In the start page, user can click a port, a parameter or a process data and go to other pages to see the corresponding details.