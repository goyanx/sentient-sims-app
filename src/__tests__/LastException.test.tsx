import '@testing-library/jest-dom';
import fs from 'fs';
import { LastExceptionService } from 'main/sentient-sims/services/LastExceptionService';
import path from 'path';
import { mockDirectoryService } from './util';

// const xml = `<?xml version="1.0" ?><root>
// <report><version>2</version><sessionid>9372980540908e6c64c28761</sessionid><type>desync</type><sku>ea.maxis.sims4_64.15.pc</sku><createtime>2023-07-27 12:43:04</createtime><buildsignature>Local.Unknown.Unknown.1.99.264.1030-1.200.000.600.Release</buildsignature><categoryid>socket.py:596</categoryid><desyncid>9372980540908e6c64c28761</desyncid><systemconfig/><screenshot/><desyncdata>[manus] Setup error for service sentient_sims_service. This will likely cause additional errors in the future. (ConnectionResetError: [WinError 10054] An existing connection was forcibly closed by the remote host)&#13;&#10;Traceback (most recent call last):&#13;&#10;&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Core\\sims4\\utils.py", line 157, in wrapper&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Core\\sims4\\utils.py", line 175, in wrapper&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Server\\areaserver.py", line 250, in c_api_zone_init&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Server\\game_services.py", line 171, in start_services&#13;&#10;  File "C:\\Users\\Username\\Documents\\Electronic Arts\\The Sims 4\\Mods\\sentient-sims\\Scripts\\sentient_sims_code\\injector.py", line 18, in _wrapped_function&#13;&#10;    return new_function(original_function, *args, **kwargs)&#13;&#10;  File "C:\\Users\\Username\\Documents\\Electronic Arts\\The Sims 4\\Mods\\sentient-sims\\Scripts\\sentient_sims_code\\sentient_sims_service.py", line 105, in start_services&#13;&#10;    original(self, *args, **kwargs)&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Core\\sims4\\service_manager.py", line 300, in start_services&#13;&#10;  File "C:\\Users\\Username\\Documents\\Electronic Arts\\The Sims 4\\Mods\\sentient-sims\\Scripts\\sentient_sims_code\\sentient_sims_service.py", line 54, in setup&#13;&#10;    SentientMemoriesService.unload_all_memories()&#13;&#10;  File "C:\\Users\\Username\\Documents\\Electronic Arts\\The Sims 4\\Mods\\sentient-sims\\Scripts\\sentient_sims_code\\memories.py", line 84, in unload_all_memories&#13;&#10;    urllib.request.urlopen(req, timeout=20)&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 222, in urlopen&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 525, in open&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 543, in _open&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 503, in _call_chain&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 1345, in http_open&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 1323, in do_open&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\http\\client.py", line 1338, in getresponse&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\http\\client.py", line 296, in begin&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\http\\client.py", line 257, in _read_status&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\socket.py", line 596, in readinto&#13;&#10;ConnectionResetError: [WinError 10054] An existing connection was forcibly closed by the remote hostrtim=0&#13;&#10;ClientInfo isn't here</desyncdata></report>
// <report><version>2</version><sessionid>9372980540908e6c64c28761</sessionid><type>desync</type><sku>ea.maxis.sims4_64.15.pc</sku><createtime>2023-07-27 12:43:08</createtime><buildsignature>Local.Unknown.Unknown.1.99.264.1030-1.200.000.600.Release</buildsignature><categoryid>socket.py:596</categoryid><desyncid>9372980540908e6c64c28761</desyncid><systemconfig/><screenshot/><desyncdata>[manus] sentient_sims_service failed to handle zone load due to exception (ConnectionResetError: [WinError 10054] An existing connection was forcibly closed by the remote host)&#13;&#10;Traceback (most recent call last):&#13;&#10;&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Server\\areaserver.py", line 118, in wrapped&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Server\\areaserver.py", line 114, in finally_wrap&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Core\\sims4\\utils.py", line 157, in wrapper&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Core\\sims4\\utils.py", line 175, in wrapper&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Server\\areaserver.py", line 371, in c_api_client_connect&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Server\\zone.py", line 599, in do_zone_spin_up&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Server\\zone_spin_up_service.py", line 1620, in update&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Server\\zone_spin_up_service.py", line 262, in on_enter&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Core\\sims4\\service_manager.py", line 423, in on_zone_load&#13;&#10;  File "C:\\Users\\Username\\Documents\\Electronic Arts\\The Sims 4\\Mods\\sentient-sims\\Scripts\\sentient_sims_code\\sentient_sims_service.py", line 81, in on_zone_load&#13;&#10;    if SentientSimsConfig.is_enabled() and app_upgrade_required():&#13;&#10;  File "C:\\Users\\Username\\Documents\\Electronic Arts\\The Sims 4\\Mods\\sentient-sims\\Scripts\\sentient_sims_code\\version.py", line 50, in app_upgrade_required&#13;&#10;    app_version = get_app_version()&#13;&#10;  File "C:\\Users\\Username\\Documents\\Electronic Arts\\The Sims 4\\Mods\\sentient-sims\\Scripts\\sentient_sims_code\\version.py", line 46, in get_app_version&#13;&#10;    return None&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 222, in urlopen&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 525, in open&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 543, in _open&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 503, in _call_chain&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 1345, in http_open&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 1323, in do_open&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\http\\client.py", line 1338, in getresponse&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\http\\client.py", line 296, in begin&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\http\\client.py", line 257, in _read_status&#13;&#10;  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\socket.py", line 596, in readinto&#13;&#10;ConnectionResetError: [WinError 10054] An existing connection was forcibly closed by the remote hostrtim=0&#13;&#10;ClientInfo isn't here</desyncdata></report>
// </root>`;
const expectedParsedResult = `[manus] Setup error for service sentient_sims_service. This will likely cause additional errors in the future. (ConnectionResetError: [WinError 10054] An existing connection was forcibly closed by the remote host)
Traceback (most recent call last):

  File "T:\\InGame\\Gameplay\\Scripts\\Core\\sims4\\utils.py", line 157, in wrapper
  File "T:\\InGame\\Gameplay\\Scripts\\Core\\sims4\\utils.py", line 175, in wrapper
  File "T:\\InGame\\Gameplay\\Scripts\\Server\\areaserver.py", line 250, in c_api_zone_init
  File "T:\\InGame\\Gameplay\\Scripts\\Server\\game_services.py", line 171, in start_services
  File "C:\\Users\\Username\\Documents\\Electronic Arts\\The Sims 4\\Mods\\sentient-sims\\Scripts\\sentient_sims_code\\injector.py", line 18, in _wrapped_function
    return new_function(original_function, *args, **kwargs)
  File "C:\\Users\\Username\\Documents\\Electronic Arts\\The Sims 4\\Mods\\sentient-sims\\Scripts\\sentient_sims_code\\sentient_sims_service.py", line 105, in start_services
    original(self, *args, **kwargs)
  File "T:\\InGame\\Gameplay\\Scripts\\Core\\sims4\\service_manager.py", line 300, in start_services
  File "C:\\Users\\Username\\Documents\\Electronic Arts\\The Sims 4\\Mods\\sentient-sims\\Scripts\\sentient_sims_code\\sentient_sims_service.py", line 54, in setup
    SentientMemoriesService.unload_all_memories()
  File "C:\\Users\\Username\\Documents\\Electronic Arts\\The Sims 4\\Mods\\sentient-sims\\Scripts\\sentient_sims_code\\memories.py", line 84, in unload_all_memories
    urllib.request.urlopen(req, timeout=20)
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 222, in urlopen
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 525, in open
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 543, in _open
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 503, in _call_chain
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 1345, in http_open
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\urllib\\request.py", line 1323, in do_open
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\http\\client.py", line 1338, in getresponse
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\http\\client.py", line 296, in begin
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\http\\client.py", line 257, in _read_status
  File "T:\\InGame\\Gameplay\\Scripts\\Lib\\socket.py", line 596, in readinto
ConnectionResetError: [WinError 10054] An existing connection was forcibly closed by the remote hostrtim=0
ClientInfo isn't here`;

describe('Formatter', () => {
  it('should trim sentence', () => {
    const directoryService = mockDirectoryService();
    const lastExceptionService = new LastExceptionService(directoryService);
    const expectedFileName = 'lastException-1901283.txt';
    const lastExceptionFile = path.join(
      directoryService.getSims4Folder(),
      expectedFileName
    );

    directoryService.createDirectoryIfNotExist(
      directoryService.getSims4Folder()
    );

    fs.copyFileSync('./src/__tests__/lastException.txt', lastExceptionFile);

    const files = lastExceptionService.getLastExceptionFiles();
    const expectedFile = files[0];
    expect(expectedFile).toEqual(lastExceptionFile);

    const parsedFiles = lastExceptionService.getParsedLastExceptionFiles();
    const actualParsedFile = parsedFiles[0];
    expect(actualParsedFile.filename).toEqual(expectedFileName);
    expect(actualParsedFile.text).toEqual(expectedParsedResult);
  });
});
