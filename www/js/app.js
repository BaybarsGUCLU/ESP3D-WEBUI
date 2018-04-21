var ESP3D_authentication = false;
var page_id = "";

window.onload = function() {
    //to check if javascript is disabled like in anroid preview
    document.getElementById('loadingmsg').style.display = 'none';
    if (!!window.EventSource) {
      var source = new EventSource('/events');
      source.addEventListener('InitID', function(e) {
      page_id = e.data;
      console.log("page id = " + page_id); 
      }, false);

      source.addEventListener('ActiveID', function(e) {
        if(page_id != e.data) {
            Disable_interface();
            console.log("I am disabled");
            source.close();
        }
      }, false);
    }
    console.log("init cmd processor");
    setInterval(function(){ process_cmd(); }, 100);
    console.log("Connect to board");
    connectdlg();
};

//window.addEventListener("resize", OnresizeWindow);

//function OnresizeWindow(){
//}
var total_boot_steps = 5;
var current_boot_steps = 0;

function display_boot_progress(step){
	var val = 1;
	if (typeof step != 'undefined')val = step;
	current_boot_steps+=val;
	console.log(current_boot_steps);
	console.log(Math.round((current_boot_steps*100)/total_boot_steps));
	document.getElementById('load_prg').value=Math.round((current_boot_steps*100)/total_boot_steps);
}


function Disable_interface() {
    //block all communication
    http_communication_locked = true;
    //clear all waiting commands
    clear_cmd_list();
    //no camera 
    document.getElementById('camera_frame').src = "";
    //No auto check
    on_autocheck_position(false);
    on_autocheck_temperature(false);
    UIdisableddlg();
}

function update_ui_text(){   
    build_HTML_setting_list(current_setting_filter);
}

function update_UI_firmware_target() {
    var fwName;
    if (target_firmware == "repetier" ) {
        fwName = "Repetier";
        document.getElementById('configtablink').style.display = 'block';
        }
    else if (target_firmware == "repetier4davinci" ) {
        fwName = "Repetier for Davinci";
        document.getElementById('configtablink').style.display = 'block';
        }
    else if (target_firmware == "smoothieware" ) {
        fwName = "Smoothieware";
        document.getElementById('configtablink').style.display = 'block';
        }
    else if (target_firmware == "marlin" ) {
        fwName = "Marlin";
        document.getElementById('configtablink').style.display = 'none';
        }
    else if (target_firmware == "marlinkimbra" ) {
        fwName = "Marlin Kimbra";
        document.getElementById('configtablink').style.display = 'none';
        }
    else if (target_firmware == "grbl" ) {
        fwName = "Grbl";
        document.getElementById('configtablink').style.display = 'block';
        }
    else {
            fwName = "Unknown";
            document.getElementById('configtablink').style.display = 'none';
            }
    if (typeof document.getElementById('fwName') != "undefined")document.getElementById('fwName').innerHTML=fwName;
    //SD image or not
    if (direct_sd && typeof document.getElementById('showSDused')!= "undefined")document.getElementById('showSDused').innerHTML="<svg width='1.3em' height='1.2em' viewBox='0 0 1300 1200'><g transform='translate(50,1200) scale(1, -1)'><path  fill='#777777' d='M200 1100h700q124 0 212 -88t88 -212v-500q0 -124 -88 -212t-212 -88h-700q-124 0 -212 88t-88 212v500q0 124 88 212t212 88zM100 900v-700h900v700h-900zM500 700h-200v-100h200v-300h-300v100h200v100h-200v300h300v-100zM900 700v-300l-100 -100h-200v500h200z M700 700v-300h100v300h-100z' /></g></svg>";
    else document.getElementById('showSDused').innerHTML="";
    return fwName;
}

function initUI() {
	console.log("Init UI");
	if (ESP3D_authentication)connectdlg (false);
    AddCmd(display_boot_progress);
    //initial check
    if ((typeof target_firmware == "undefined") || (typeof web_ui_version == "undefined") || (typeof direct_sd == "undefined") ) alert('Missing init data!');
    //check FW
    update_UI_firmware_target();
    //update UI version
    if (typeof document.getElementById('UI_VERSION') != "undefined")document.getElementById('UI_VERSION').innerHTML=web_ui_version;
    //update FW version
    if (typeof document.getElementById('FW_VERSION') != "undefined")document.getElementById('FW_VERSION').innerHTML=fw_version;
    // Get the element with id="defaultOpen" and click on it
    document.getElementById("maintablink").click();
    //removeIf(production)
    console.log(JSON.stringify(translated_list));
    //endRemoveIf(production)
    console.log("Get preferences");
    getpreferenceslist();
    initUI_2();
}

function initUI_2() {
	AddCmd(display_boot_progress);
    //get all settings from ESP3D
    console.log("Get settings");
    refreshSettings();
    initUI_3();
}
function initUI_3() {
	AddCmd(display_boot_progress);
    //init panels 
    console.log("Get macros");
    init_controls_panel(); 
	initUI_4();
}
function initUI_4() {
	AddCmd(display_boot_progress);  
    init_temperature_panel();
    init_extruder_panel();
    init_command_panel();
    init_files_panel(false);
    //check if we need setup
    if ( target_firmware == "???"){
		console.log("Launch Setup");
		AddCmd(display_boot_progress);
		closeModal("Connection successful");
        setupdlg();
    } else {
            setup_is_done = true;
            AddCmd(display_boot_progress);
            build_HTML_setting_list(current_setting_filter);
            AddCmd(closeModal);
            AddCmd(show_main_UI);
        }
}

function show_main_UI(){
	document.getElementById('main_ui').style.display='block';
}

function compareStrings(a, b) {
  // case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return (a < b) ? -1 : (a > b) ? 1 : 0;
}

function compareInts(a, b) {
  return (a < b) ? -1 : (a > b) ? 1 : 0;
}

function HTMLEncode(str){
  var i = str.length,
      aRet = [];

  while (i--) {
    var iC = str[i].charCodeAt();
    if (iC < 65 || iC > 127 || (iC>90 && iC<97)) {
        if(iC==65533) iC=176;
        aRet[i] = '&#'+iC+';';
    } else {
      aRet[i] = str[i];
    }
   }
  return aRet.join('');    
}

function decode_entitie(str_text) {
var tmpelement = document.createElement('div');
tmpelement.innerHTML = str_text;
str_text = tmpelement.textContent;
tmpelement.textContent = '';
return str_text;
}
