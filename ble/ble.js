<!doctype html>
<html>
</html>


const
decoder = new TextDecoder('utf-8'),
encoder = new TextEncoder('utf-8')
;

export class ble{

	//myDescriptor;

	constructor(){
		this.descriptor = null;
	}
	
	bind(name,serviceUuid,characteristicUuid){		
	  navigator.bluetooth.requestDevice({
		filters: [{name}], // <- Prefer filters to save energy & show relevant devices.
		acceptAllDevices: true,
		optionalServices: [serviceUuid]})
	  .then(device => device.gatt.connect())
	  .then(server => server.getPrimaryService(serviceUuid)
	  .then(service => service.getCharacteristic(characteristicUuid)
	  .then(characteristic => characteristic.getDescriptor('gatt.characteristic_user_description')
	  .then(descriptor => this.descriptor = descriptor)
	  .catch(console.error);
	},
	
	read: (descriptor) => {
		return decoder.decode(this.descriptor.readValue())
	},

	write: (descriptor,value) => {
	  this.descriptor.writeValue(encoder.encode(value))
	  .catch(console.error);
	}
}