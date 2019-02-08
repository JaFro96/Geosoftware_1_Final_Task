'use strict';

/**
* @desc used for a function to delete all institutes
* @author Jannis Fröhlking
*/

/**
*  @desc: function which deletes all entries
*/
function deleteAll()
{
  $.ajax({
    type:'DELETE',
    url:'./institutes',

    success : function( data) {
      console.log('success');
    },
    error : function() {
      console.log('error');

    }
  })
}
