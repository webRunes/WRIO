import React from 'react';
import { connect } from 'react-redux';
import ProviderLink from './BackToTheProvidersPageButton.js';
import { MapBoxGl } from './mapbox/mapboxV2.js';
import ToolTipLite from 'react-tooltip-lite';
import gconfig from '../../config';
import {NormailizeJSON} from "./utils/string"
const signalR = require("@aspnet/signalr");

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
class DeviveProfileTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {         
          devicestatus: "off",
          temperature: "0",
          testbed_network: "0",
          tx_level: "0",
          cha: "0",
          tx_mode:"0",
          rx_mode:"0",
          rssi: "0",
          lqi: "0",
          nodeid: "0",
          chopt : "",
          txopt: ""
        }
    }
    componentDidMount() {
      toast.configure();
      this.getDropdownData();
      this.getSensorData();
      
      let connection = new signalR.HubConnectionBuilder()
    .configureLogging(signalR.LogLevel.Debug)
  .withUrl(gconfig.gatewaysServiceUrl+'/devHub')
  .build();
      
    connection.on("ReceiveMessage", (topic ,jdata) => {
          console.log("ReceiveMessage:["+topic+"] "+ jdata);          
          if(topic == "/iot/sensor/data" ){
            jdata =  NormailizeJSON(jdata);
            var data = JSON.parse(jdata);
            this.setState({ temperature: (parseFloat(data.Temperature)/1000)});
            this.setState({ testbed_network: data.PanIdVal});
            this.setState({ tx_level: data.TXLevel});
            this.setState({ cha: data.ChaVal});
            this.setState({ tx_mode: data.TxModeVal});
            this.setState({ rx_mode: data.RxModeVal});
            this.setState({ rssi: data.RssiVal});
            this.setState({ lqi: data.LqiVal});
            this.setState({ nodeid: data.NodeId});
            this.setState({ devicestatus: "off"});
          }
          else if(topic == "/iot/sensor/error"){
            if(jdata.includes("SERIALACCESSERROR")){           
              this.setState({ devicestatus: "on"});
            }            
            if(jdata.includes("SERIALREADWRITEERROR")){              
              this.setState({ devicestatus: "on"});
            }
          }
      });
      connection.on("send", data => {
          console.log(data);
      });
      
      connection.start().then(function () {
        console.log('Connected!');                
    }).catch(function (err) {
        return console.error("signalr error: "+err.toString());
    })

    try {
      this.interval = setInterval(async () => {
        const res = await fetch(gconfig.gatewaysServiceUrl+"/api/Device/IsDeviceConnected");
        const devstatus = await res.json();
        if(devstatus!= null && devstatus.status == false)
          this.setState({ devicestatus: "on"});                
        console.log(devstatus);
      }, 50000);
    } catch(e) {
      console.log(e);
    }

    }

    setConfig = () => {
      var setval={dev:"Mote",opr:this.state.devicestatus};    
      fetch(gconfig.gatewaysServiceUrl+"/api/Device", {
        method: "POST",
        dataType: "JSON",
        headers: {
          "Access-Control-Allow-Origin": "*",
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(setval)
      })
      .then((resp) => {
        return resp.json()
      })
      .then((data) => {
        if(data.status){
          if(this.state.devicestatus === "on" )
            this.setState({ devicestatus: "off"});
          else
          this.setState({ devicestatus: "on"});
        }
        else{
          this.setState({ devicestatus: "on"});
          toast.error("Device seems offline, Please start Experiment!!!");
        }
      })
      .catch((error) => {
        console.log(error, "catch the hoop")
      })
    }
    setTxConfig = (event) => {      
      this.setState({tx_level: event.target.value});
      var setval={dev:"Mote",opr:"SETTX="+event.target.value+"\n"};
      
      fetch(gconfig.gatewaysServiceUrl+"/api/Device", {
        method: "POST",
        dataType: "JSON",
        headers: {
          "Access-Control-Allow-Origin": "*",
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(setval)
      })
      .then((resp) => {
        return resp.json()
      })
      .then((data) => {
        //this.setTxVal(dataval.txLevel);        
      })
      .catch((error) => {
        console.log(error, "catch the hoop")
      })
    }
    setChConfig = (event) => {      
      var setval={dev:"Mote",opr:"SETCH="+event.target.value+"\n"};
      this.setState({cha: event.target.value});      
      fetch(gconfig.gatewaysServiceUrl+"/api/Device", {
        method: "POST",
        dataType: "JSON",
        headers: {
          "Access-Control-Allow-Origin": "*",
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(setval)
      })
      .then((resp) => {
        return resp.json()
      })
      .then((data) => {
        console.log("here data is ",data);
      })
      .catch((error) => {
        console.log(error, "catch the hoop")
      })
    }
    getDropdownData = () => {
      var setval={dev:"Zolertia",opr:this.state.devicestatus};
      //console.log("Here object is "+JSON.stringify(object));
      fetch(gconfig.gatewaysServiceUrl+"/api/Component/GetJson", {
        method: "POST",
        dataType: "JSON",
        headers: {
          "Access-Control-Allow-Origin": "*",
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(setval)
      })
      .then((resp) => {
        return resp.json()
      })
      .then((dataval) => {
        //var sensordata = JSON.parse(data)
        console.log('here option data '+dataval);
        if(dataval != null){        
        this.setState({ txopt: dataval.txlevelconfigs});
        this.setState({ chopt: dataval.chconfigs});        
        }
      })
      .catch((error) => {
        console.log(error, "catch the hoop")
      })
    }
    getSensorData = () => {
      var setval={dev:"Mote",opr:this.state.devicestatus};
      //console.log("Here object is "+JSON.stringify(object));
      fetch(gconfig.gatewaysServiceUrl+"/api/Device/GetSensorValue", {
        method: "GET",
        dataType: "JSON",
        headers: {
          "Access-Control-Allow-Origin": "*",
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        //body: JSON.stringify(setval)
      })
      .then((resp) => {
        return resp.json()
      })
      .then((dataval) => {
        //var sensordata = JSON.parse(data)
        console.log('here data '+dataval);
        if(dataval != null){
        this.setState({ temperature: (parseFloat(dataval.temperature)/1000)});
        this.setState({ testbed_network: dataval.panIdVal});
        this.setState({ cha: dataval.chaVal});
        this.setState({ rssi: dataval.rssiVal});
        this.setState({ lqi: dataval.lqiVal});
        this.setState({ nodeid: dataval.nodeId});
        this.setState({ tx_mode: dataval.txModeVal});
        this.setState({ rx_mode: dataval.rxModeVal});
        this.setState({ tx_level: dataval.txLevel});
        
        if(dataval.isEnabled){
          this.setState({ devicestatus: "off"});
        }
        if(!dataval.isEnabled){
          this.setState({ devicestatus: "on"});
        }
        //this.setTxVal(dataval.txLevel);
        }
        else{
          this.setState({ devicestatus: "on"});
        }
      })
      .catch((error) => {
        console.log(error, "catch the hoop")
      })
    }
    render() {
        let feedData = this.props.feed;
        let productData = this.props.sensorProductData;
        let providerLink = feedData.provider != undefined ? feedData.provider: undefined;
        let txoptions = this.state.txopt;
        let txoptionItems;
        if(txoptions != ""){
        txoptionItems = txoptions.map((tx) =>
                <option key={tx.key}>{tx.value}</option>
            );
        }
        let choptions = this.state.chopt;
        let choptionItems;
        if(choptions != ""){
        choptionItems = choptions.map((ch) =>
                <option key={ch.key}>{ch.value}</option>
            );
        }
        return (
            <div className="product">
            {
             providerLink !=undefined ?<ProviderLink providerLink={providerLink}/>:null
            }

          
            <div className="row">
              <div className="col-sm-6">
                {
                 <img src={productData ? (productData.image?productData.image:'https://default.wrioos.com/img/no-photo-200x200.png'): 'https://default.wrioos.com/img/no-photo-200x200.png'} width="200" height="200"/>
                }
              </div>
              <div className="col-sm-6">
                <h2>Product details</h2>
                  {
                   productData !=undefined && productData.productID != undefined ? <div>
                    <div>Product ID: {productData ? productData.productID: ''}</div>
                    <div>Name: {productData? productData.name: ''}</div>
                    <div>Description: {productData? productData.description: ''}</div>
                    <div>Brand: {productData? productData.brand: ''}</div>
                    <div>Manufacturer: {productData? productData.manufacturer: ''}</div>
                    <div>Production Date: {productData? productData.productionDate: ''}</div>
                    <div>Purchase Date: {productData? productData.purchaseDate: ''}</div>
                    <div>Release Date: {productData? productData.releaseDate: ''}</div>
                    <div>Height: {productData? productData.height: ''}</div>
                    <div>Weight: {productData? productData.weight: ''}</div>
                    <div>Width: {productData? productData.width: ''}</div>
                  </div>: null
                  }
              </div>
            </div>
            <div className="row">
            <div className="control-left control-panel col-sm-6">
              <h2></h2>              
              <button class={this.state.devicestatus=== "off" ?  "btn btn-danger btn-sm" : "btn btn-success btn-sm"} type="button" id="Mote" ref="Mote" value={this.state.devicestatus}  onClick={this.setConfig} data-loading-text="Loading ...">Turn {this.state.devicestatus} Zolertia</button>
              <h2></h2>
            </div>
            <div className="control-right control-panel col-sm-6 ">
            <h2 class="text-left">Radio parameters</h2>
                          
            <ToolTipLite className="tooltip-b" content="Transmission power in dBm">
            <div class="text-left">TXLevel: {this.state.devicestatus=== "off" ? <React.Fragment> <select  onChange={this.setTxConfig} value={this.state.tx_level}>
                  {txoptionItems}
              </select></React.Fragment> : <React.Fragment>Unknown</React.Fragment>}</div>               
              </ToolTipLite>
            

            
            <ToolTipLite className="tooltip-b" content="Radio communication channel">
            <div class="text-left">Channel: {this.state.devicestatus=== "off" ? <React.Fragment> <select  onChange={this.setChConfig} value={this.state.cha}>
                 {choptionItems}
              </select></React.Fragment> : <React.Fragment>Unknown</React.Fragment>}</div> 
              
              
              
              </ToolTipLite>
           

            
              <ToolTipLite className="tooltip-b" content="Radio communication channel">
                <div class="text-left">Network ID: {this.state.devicestatus=== "off" ? <React.Fragment> {this.state.testbed_network}</React.Fragment> : <React.Fragment>Unknown</React.Fragment>}</div>              
              </ToolTipLite>
            
            
            <ToolTipLite className="tooltip-b" content="Node unique identificator">
              <div class="text-left">Node uID: {this.state.devicestatus=== "off" ? <React.Fragment> {this.state.nodeid}</React.Fragment> : <React.Fragment>Unknown</React.Fragment>}</div>              
              </ToolTipLite>
            
            
            <ToolTipLite className="tooltip-b" content="Received signal strength indicator in dBm">
            <div class="text-left">RSSI, dBm: {this.state.devicestatus=== "off" ? <React.Fragment> {this.state.rssi}</React.Fragment> : <React.Fragment>Unknown</React.Fragment>}</div>              
              </ToolTipLite>
            
            
            <ToolTipLite className="tooltip-b" content="Link quality indicator">
            <div class="text-left">LQI: {this.state.devicestatus=== "off" ? <React.Fragment> {this.state.lqi}</React.Fragment> : <React.Fragment>Unknown</React.Fragment>}</div>              
              </ToolTipLite>
            
            
            <ToolTipLite className="tooltip-b" content="Radio receiver mode">
            <div class="text-left">RX Mode: {this.state.devicestatus=== "off" ? <React.Fragment> {this.state.rx_mode}</React.Fragment> : <React.Fragment>Unknown</React.Fragment>}</div>              
              </ToolTipLite>
            
            
            <ToolTipLite className="tooltip-b" content="Radio transmission mode">
            <div class="text-left">TX Mode: {this.state.devicestatus=== "off" ? <React.Fragment> {this.state.tx_mode}</React.Fragment> : <React.Fragment>Unknown</React.Fragment>}</div>              
              </ToolTipLite>
            
              
            </div>
          </div>

            <div className="row">
              <div className="col-sm-6">
              <MapBoxGl/>
              </div>
              <div className="col-sm-6">
                <h2>Location</h2>
                <div>imec Ghent</div>
                <div><a href="mailto:info@imec.be">info@imec.be</a></div>
                <div>+32 9 248 55 55</div>
                <div>De Krook</div>
                <div>Miriam Makebaplein 1</div>
                <div>9000 Ghent</div>
                <div>Belgium</div>
              </div>
            </div>
            </div>
        );
    }
}



const mapStateToProps = state => ({
    feed: state.document.feed,
    sensorProductData: state.document.feedProductData,
    geoCoordinates: state.document.geoCoordinates
  });

  export const DeviceProfile = connect(mapStateToProps)(DeviveProfileTab);
