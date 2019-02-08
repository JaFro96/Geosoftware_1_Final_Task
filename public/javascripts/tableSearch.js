'use strict';

/**
* @desc used for defining functions for searching in tables
* @author Jannis Fröhlking
*/

// create a logger
var consoleAppender = JL.createConsoleAppender('consoleAppender');
JL("mylogger").setOptions({"appenders": [consoleAppender]});

$( document ).ready(function(){
    /**
    * @desc: Save the names of institutes in an array when clicking on the search input field
    */
    // array for saving the current names of institutes in the database
    var data=[];
    $("#search").click(function() {
      data = [];
      $("#myTable tr").each(function(rowIndex) {
        $(this).find("td").each(function(cellIndex) {
          if (cellIndex== 0){
            data.push($(this).text());
          }
        });
      });
    // Integrete autocomplete to the search input field
    $(".autocomplete").autocomplete({
        source: data,
        autoFocus: true
      });
    });

    /**
    * @desc: Check if the text input matches a names in the table of objects and only show the matched ones!
    */
    $("#search").change(function() {
      var sString= $("#search").val();
      //@see: https://stackoverflow.com/questions/5475142/jquery-get-elements-in-a-specified-columns-of-an-html-table
      $("#myTable tr").each(function(rowIndex) {
        var rIndex=[];
        $(this).find("td").each(function(cellIndex) {
            if (cellIndex== 0){
                var checkText=$(this).text();
                // If the input search string matches a string of a name in the table, log that
                if(checkText.substring(0, sString.length)==sString){
                    JL("mylogger").info("These string match!"+sString);
                }
                else{
                    rIndex.push(rowIndex);
                }
              }
        });
        var da=true;
        // Hide all the objects in the table which do not match with the search input string
        for (var i in rIndex){
          if(rIndex[i]==rowIndex){
            $(this).hide();
            da=false;
          }
        }
        // if the input field is empty again or matches with all of the names of input fields, show the entire table
        if(da){
          $(this).show();
        }
      });
    })

    /**
    * @desc: Check if the text input matches object on the second attribute. Used for searching routes with the same starting points
    */
    $("#searchSecond").change(function() {
      var sString= $("#searchSecond").val();
      //@see: https://stackoverflow.com/questions/5475142/jquery-get-elements-in-a-specified-columns-of-an-html-table
      $("#myTable tr").each(function(rowIndex) {
        var data=[];
        var rIndex=[];
        $(this).find("td").each(function(cellIndex) {
            if (cellIndex== 1){
                data.push($(this).text());
                var checkText=$(this).text();
                if(checkText.substring(0, sString.length)==sString){
                    JL("mylogger").info("These string match!"+sString);
                }
                else{
                    rIndex.push(rowIndex);
                }
              }
        });
        var da=true;
        for (var i in rIndex){
          if(rIndex[i]==rowIndex){
            $(this).hide();
            da=false;
          }
        }
        if(da){
          $(this).show();
        }
      });
    })

    /**
    * @desc: Nearly same like the methods above, but this time we search for equal end places of the routes!
    */
    $("#searchEnd").change(function() {
      var sString= $("#searchEnd").val();
      //@see: https://stackoverflow.com/questions/5475142/jquery-get-elements-in-a-specified-columns-of-an-html-table
      $("#myTable tr").each(function(rowIndex) {
        var data=[];
        var rIndex=[];
        $(this).find("td").each(function(cellIndex) {
            if (cellIndex== 2){
                data.push($(this).text());
                var checkText=$(this).text();
                if(checkText.substring(0, sString.length)==sString){
                    JL("mylogger").info("These string match!"+sString);
                }
                else{
                    rIndex.push(rowIndex);
                }
              }
        });
        var da=true;
        for (var i in rIndex){
          if(rIndex[i]==rowIndex){
            $(this).hide();
            da=false;
          }
        }
        if(da){
          $(this).show();
        }
      });
    });
});
