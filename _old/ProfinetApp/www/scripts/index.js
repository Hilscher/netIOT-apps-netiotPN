/**
 * Copyright (c) 2016 Hilscher Gesellschaft fuer Systemautomation mbH
 *
 * Licensed under the MIT License, - see MITLicense.txt.
 *
 * The functions for Cordova.
 */

(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Verarbeiten der Cordova-Pause- und -Fortsetzenereignisse
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener( 'resume', onResume.bind( this ), false );

        sap.ui.getCore().attachInit(createMobileAppPages);

        if (cordova && cordova.plugins && cordova.plugins.certificates) {
          cordova.plugins.certificates.trustUnsecureCerts(true)
        }
    };

    function onPause() {
    };

    function onResume() {
    };
} )();