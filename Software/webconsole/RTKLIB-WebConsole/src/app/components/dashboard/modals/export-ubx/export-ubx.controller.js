/*
 * RTKLIB WEB CONSOLE code is placed under the GPL license.
 * Written by Frederic BECQUIER (frederic.becquier@openiteam.fr)
 * Copyright (c) 2016, DROTEK SAS
 * All rights reserved.

 * If you are interested in using RTKLIB WEB CONSOLE code as a part of a
 * closed source project, please contact DROTEK SAS (contact@drotek.com).

 * This file is part of RTKLIB WEB CONSOLE.

 * RTKLIB WEB CONSOLE is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * RTKLIB WEB CONSOLE is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with RTKLIB WEB CONSOLE. If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

module.exports = /*@ngInject*/ function ($scope, log, $modalInstance) {

    /* Controller parameters */
    $scope = angular.extend($scope, {
        downloadFile: undefined,
		ubxFiles: undefined
    });
    
    log.getListUbxFiles().then(function(result){
        $scope.ubxFiles = result;
        $scope.downloadFile = result[0];
    });

    function createDownloadLink(blob, fileName){
      var url;
      var downloadLink = document.createElement('a');
      var downloadAttributeSupported = 'download' in downloadLink;
      var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;

      if(urlCreator){
          if (downloadAttributeSupported) {
              url = urlCreator.createObjectURL(blob);
              downloadLink.href = url;
              downloadLink.download = fileName;
              downloadLink.style.display = 'none';
              downloadLink.click();
          }else{
              url = urlCreator.createObjectURL(blob);
              window.open(url, '_blank', '');
          }
      }
    }

    function saveBlob(blob, fileName){
      window.saveAs = window.saveAs || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs;
      if (window.saveAs) {
          window.saveAs(blob, fileName);
      }
      else {
          navigator.saveBlob(blob, fileName);
      }
    }

    function saveFile(blob, fileName){

      navigator.saveBlob =  navigator.saveBlob || navigator.msSaveBlob ||
                            navigator.mozSaveBlob || navigator.webkitSaveBlob;

      if(navigator.saveBlob){
          saveBlob(blob,fileName);
      }else {
          createDownloadLink(blob,fileName);
      }
    }
    
    /**
     * Function called to export ubx file
     */
    $scope.ok = function () {
        log.getUbxFile($scope.downloadFile).then(function(result){
            
            var blob = new Blob([result]);
            saveFile(blob, $scope.downloadFile);
            
            $modalInstance.close();
        });
    };

    /**
     * Function called to cancel the export.
     */
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
}