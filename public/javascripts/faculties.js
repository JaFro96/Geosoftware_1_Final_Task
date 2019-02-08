'use strict';

/**
* @desc Just used for adding some logs
* @author Jannis Fröhlking
*/

// create a logger
var consoleAppender = JL.createConsoleAppender('consoleAppender');
JL("mylogger").setOptions({"appenders": [consoleAppender]});

$(document).ready(function() {
  /**
  * @desc inform user about changes and delets
  */
  $("#scInput").change(function() {
    var mySC =$("#scInput").val();
    // Warning for a too long shortcut
    if(mySC.length>4)
    {
      JL("mylogger").warn("This shortcut is way too long!");
    }
    else
    {
      // Warning for a shortcut with a bad beginning
      if(mySC[0]=='F' && mySC[1]=='B')
      {
        JL("mylogger").info("Appropriate shortcut!");
      }
      else {
        JL("mylogger").warn("Inappropriate shortcut! Start your shortcut with 'FB'");
      }
    }
  });

  $("#sendchanges").click(function() {
    alert("Changes are send to database"+"\n"+ "name="+$('#facname').val()+ ", shortcut=" +$('#facsc').val()+", website=" +$('#facurl').val());
  });

  $("#deletefac").click(function() {
    JL("mylogger").info("Hopefully these institutes are now gone: "+$("#hidlist").val());
    alert("Faculty successfull deleted"+ "\n"+"name="+$('#facname').val());
  });

  $("#inslist").mouseover(function(){
    JL("mylogger").warn("Changes here are only allowed if you change the institute itself!");
  });
});
