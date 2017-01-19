const request = require('request');
const cheerio = require('cheerio');
module.exports = CorreosChile;

/**
 * Retorna el estado de un envío. 
 * TODO: Retornar objeto estandarizado con el estado
 */

function CorreosChile() {
    this.getStatus = getStatus;
    let url = "http://seguimientoweb.correos.cl/ConEnvCorreos.aspx";

    function getStatus(code) {
        return new Promise((resolve, reject) => {
            let opts = {
                uri: url,
                form: {
                    'obj_key': 'Cor398-cc',
                    'obj_env': code
                }
            };

            request.post(opts, (err, res, data) => {
                if(err !== null) {
                    reject(err);
                }

                // Cargar datos
                let $ = cheerio.load(data);
                let t = $('.tracking tr');

                // Tabla de estados no existe
                if(t.length <= 0) {
                    if($('.envio_no_existe').length > 0) {
                        // Muestra error de que el envío no existe
                        reject('no existe');
                    } else {
                        // Error no identificado
                        reject('error en datos recibidos');
                    }

                    return;
                }

                // Está la tabla, pero sin estados
                if(t.length < 2) {
                    reject('existe, pero no hay nada');
                    return;
                }

                /**
                 * Cuando se entrega, aparece lo siguiente;
                 <div id="Panel_Entrega">
                    
                    <font class="titulo">Datos de la entrega</font>
                    <br>
                    <br>
                    <table class="datosgenerales">
                        <tr height="30px">
                            <td width="95px"  class="generalTitulo">&nbsp;&nbsp;Envio</td>
                            <td width="200px" bgcolor="#F8F8F8"    >&nbsp;&nbsp;(codigo real)&nbsp;</td>
                            <td width="95px"  class="generalTitulo">&nbsp;&nbsp;Entregado a</td>
                            <td bgcolor="#F8F8F8"                  >&nbsp;&nbsp;(nombre recibidor)&nbsp;</td>
                        </tr>
                        <tr height="30px">
                            <td width="95px"  class="generalTitulo">&nbsp;&nbsp;Fecha Entrega</td>
                            <td width="200px" bgcolor="#F8F8F8"    >&nbsp;&nbsp;03/01/2017 12:26&nbsp;</td>
                            <td width="95px"  class="generalTitulo">&nbsp;&nbsp;Rut</td>
                            <td bgcolor="#F8F8F8"                  >&nbsp;&nbsp;(rut)&nbsp;</td>
                        </tr>
                        </table> 
                    
                </div>

                */
                // Envío entregado
                if($('#Panel_Entrega').length > 0) {
                    resolve('envio entregado');
                }

                // Cargar el último estado (la primera fila)
                let td = $('td', t.eq(1));
                let status = td.eq(0).text().replace(/&nbsp;/g, "").trim();
                let date = td.eq(1).text().replace(/&nbsp;/g, "").trim();
                let location = td.eq(2).text().replace(/&nbsp;/g, "").trim();

                resolve('estado: ' + status);
            });
        });
    }
}