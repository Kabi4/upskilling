
import moment from "moment";

 enum MotorType {
    "Car" = "Car",
    "Bike" = "Bike",
    "Truck" = "Truck"
  }
  
  interface ParkingSpot {
    isFree: Boolean;
    parkedAt: Date | null;
    spotId: string;
    lastVechicleNumber: string;
    lastFreedAt: Date | null;
    lastParkedAt: Date | null;
    spotType: MotorType;
  }


  const randomInt = (max: number) => Math.floor(Math.random() * max);
const randomLetters = (len: number) =>
  Array.from({ length: len }, () => String.fromCharCode(65 + randomInt(26))).join('');
const randomDigits = (len: number) =>
  Array.from({ length: len }, () => randomInt(10)).join('');


  const generateVehicleNumber = (): string => {
    return `${randomLetters(2)}${randomDigits(2)}${randomLetters(2)}${randomDigits(4)}`;
  }

  interface Ticket {
    ticketNumber: string;
    vehicleNumber: string;
    spotId: string;
    floorNumber: number;
    isLottedOut: boolean;
  }

  interface Vehicle {
    vehicleNumber: string;
    vehicleType: MotorType;
    ticketNumber: string;
  }
  
  const generateAplhaIdFromNumber = (num:number) :string => {
    let n = num;
    let result = '';
  
    while (n > 0) {
      n--; // shift to 0-based so A=0 ... Z=25
      result = String.fromCharCode(65 + (n % 26)) + result;
      n = Math.floor(n / 26);
    }
  
    return result;
  };
  
  const defaultParkingSpot:ParkingSpot = {
    isFree: true,
    parkedAt: null,
    spotId: "",
    lastVechicleNumber: "",
    lastFreedAt: null,
    lastParkedAt: null,
    spotType: MotorType.Car
  }
  
  const generateParkingType : () => ParkingSpot = ()=>{
    const randomType = Math.floor(Math.random() * 3);
    const allTypes = Object.values(MotorType);
    const spotType = allTypes[randomType];
    return {
      ...defaultParkingSpot,
      spotType
    }
  }
  
  class Floor {
    floorNumber: number;
    parkingSpots: Record<string,ParkingSpot> = {};

    private generateSpotId(start: number, floorNumber: number): string {
      return `${floorNumber}${generateAplhaIdFromNumber(start+1)}`;
    }

    private generateParkingType(spotId: string): ParkingSpot {
      return {
        ...generateParkingType(),
        spotId
      }
    }

    findSpot(spotId: string) {
        return Object.values(this.parkingSpots).find(spot=>spot?.spotId === spotId);
    }

    getNearestParking(vechileType : MotorType) {
        const spot = Object.values(this.parkingSpots).find(ele=>ele.spotType === vechileType && ele.isFree);
        return spot;
    }

    feeCalculator(ticket: Ticket, fees: Record<string,number>): number {
      const currentTime = moment();
      const spot:ParkingSpot|undefined = this.findSpot(ticket.spotId);
      if(!spot) {
        console.log("\x1b[31mInvalid Ticket fine $1000!\x1b[0m")
        return 1000;
       }
      const fee = fees[spot.spotType];
      const totalFee = currentTime.diff(spot.parkedAt, 'seconds') * fee;
      return totalFee;
    }

    updateSpot(spotId : string,) {
        this.parkingSpots[spotId] = {
            ...this.parkingSpots[spotId],
            isFree: false,
            parkedAt: moment().toDate(),
        }
    }

    freeSpot(ticket: Ticket): boolean {
        const spotId = ticket.spotId;
        const spot = this.parkingSpots[spotId];
        if (spot.isFree) {
            return false;
        }
        this.parkingSpots[spotId] = {
            ...spot,
            isFree: true,
            lastParkedAt: spot.parkedAt,
            parkedAt: null,
            lastFreedAt: moment().toDate(),
            lastVechicleNumber: ticket.vehicleNumber
        }
        return true;
    }

    parkInSpot(spotId: string) : boolean {
        const spot = this.findSpot(spotId);
        if (!spot) {
            return false;
        }
        this.updateSpot(spotId);
        return true;
    }

    unParkSpot(ticket: Ticket): boolean {
        return this.freeSpot(ticket);
    }

    status () : string {
        const freeSpots = Object.values(this.parkingSpots).filter(spot => spot.isFree).length;
        return `Floor ${this.floorNumber} has ${freeSpots} spots available`;
    }

    statusBySpotType(spotType?: MotorType) : string {
        const spotTypes = Object.values(MotorType);
        const status = spotTypes.map(type => {
            const spots = Object.values(this.parkingSpots).filter(spot => spot.spotType === type && spot.isFree);
            if (!!spotType && type !== spotType) return '';
            return `${type} : ${spots.length} free`;
        });
        return `Floor ${this.floorNumber} has ${status.join("\n")}`;
    }
  
    constructor(totalSpots: number, floorNumber: number = 1) {
      this.floorNumber = floorNumber;
      let start = 0;
      while(start<totalSpots) {
        const spotId:string = this.generateSpotId(start, floorNumber);
        this.parkingSpots[spotId] = this.generateParkingType(spotId);
        start++;
      }
    }
  }
  
  class ParkingLot {
    totalFloors: number;
    totalSpotsPerFloor: number;
    tickets: Ticket[] = [];
    totalRevenue: number = 0;
    floors: Floor[] = [];

    // Fees
    private fees: Record<MotorType, number> = {
      [MotorType.Car]: 100,
      [MotorType.Bike]: 50,
      [MotorType.Truck]: 200
    }

    constructor(totalFloors: number, totalSpotsPerFloor: number) {
      this.totalFloors = totalFloors;
      this.totalSpotsPerFloor = totalSpotsPerFloor;
      for(let i = 0; i < totalFloors; i++) {
        this.floors.push(new Floor(totalSpotsPerFloor, i+1));
      }
    }

    validateTicket(ticketNumber: string) {
        const ticket = this.tickets.find(t=>t.ticketNumber === ticketNumber);
        if (!ticket) {
            console.log("\x1b[31mInvalid ticket number!\x1b[0m");
        }
        return ticket;
    }

    getFee(ticketNumber: string): number {
        const ticket = this.tickets.find(t=>t.ticketNumber === ticketNumber);
        if(!ticket) {
            console.log("\x1b[31mInvalid Ticket fine $1000!\x1b[0m")
            return 1000;
        }
        const floor = this.floors[ticket?.floorNumber - 1];
        return floor.feeCalculator(ticket, this.fees);
    }

    findNearestSpotAndFloor(vehicleType: MotorType): [string, number] {
      const vechileType = vehicleType;
      let floorFind = 0;
      let spotFind = "";

      // Get the first floor which has the MotorType Availaible 
      for (let i = 0; i < this.totalFloors; i++) {
        const floor = this.floors[i];
        const spotId = floor.getNearestParking(vechileType)?.spotId;
        if(spotId) {
            spotFind = spotId;
            floorFind = floor.floorNumber;
            break;
        }
      }

      return [spotFind, floorFind];
    }

    parkVehicle(vehicle: Vehicle): string {
      // Find Spot by Vehicle Type
      const vechileType = vehicle.vehicleType;
      const isCarAlreadyThere = this.tickets.find(ele=>(ele.vehicleNumber === vehicle.vehicleNumber ) && !ele.isLottedOut);
      if (isCarAlreadyThere) {
        console.log("\x1b[31mCar is already parked!\x1b[0m");
        return '';
      }
      const [spot, floorNumber] = this.findNearestSpotAndFloor(vechileType);
      if (!spot) {
        console.log("\x1b[31mUnable to park no spot free!\x1b[0m");
        return '';
      }
      const res = this.floors[floorNumber-1].parkInSpot(spot);
      if(!res) {
        console.log("\x1b[31mUnable to park spot not free!\x1b[0m");
        return "";
      }
      const ticket: Ticket = {
        ticketNumber: generateVehicleNumber(),
        vehicleNumber: vehicle.vehicleNumber,
        spotId: spot,
        floorNumber: floorNumber,
        isLottedOut: false,
      }
      this.tickets.push(ticket);
      console.log(`\x1b[32mParked Successfully here is your ticket ${ticket.ticketNumber}. Park on ${ticket.floorNumber} floor at ${ticket.spotId}.\x1b[0m`)
      return ticket.ticketNumber;
    }

    unparkVehicle(ticketNumber: string): string {
      const ticket = this.validateTicket(ticketNumber);
      if (!ticket || ticket?.isLottedOut) return "Not able to unpark!"
      const floor = this.floors[ticket?.floorNumber-1];
      const fees = floor.feeCalculator(ticket, this.fees);
      const ticketIndex = this.tickets.findIndex(ele=>ele.ticketNumber===ticketNumber);
      if(ticketIndex !== -1) this.tickets[ticketIndex].isLottedOut = true;
      this.totalRevenue+=fees;
      floor.unParkSpot(ticket);
      return `Vehicle unparked successfully. Collect amount $${fees}`;
    }

    getStatus(): string {
      return this.floors.map(floor => floor.status()).join("\n");
    }
  }


  const lot = new ParkingLot(5, 5);

  const generateRandomVehicles = (n: number): Vehicle[] => {
    return Array.from({ length: n }, (_, i) => {
      // ticket numbers are sequential, so they are always unique
      return {
        vehicleNumber: generateVehicleNumber(),
        vehicleType: generateParkingType().spotType,
        ticketNumber: "",
      };
    });
  };

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const randomWait = () => wait((Math.floor(Math.random() * 20) + 1) * 1000);

  (async () => {
    const vech = generateRandomVehicles(30);

    vech.forEach((v, i) => {
      console.log(`trying to park a ${v.vehicleType} with number ${v.vehicleNumber}.`)
      const ticket = lot.parkVehicle(v);
      if (ticket) {
        vech[i].ticketNumber = ticket;
      }
    });

    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * vech.length);
      const randomVec = vech[randomIndex];
      //
      await randomWait();
      console.log(`trying to unpark a ${randomVec.vehicleType} with ticket number ${randomVec.ticketNumber}.`)
      console.log(`${lot.unparkVehicle(randomVec.ticketNumber)}.\x1b[0m`);
      vech[randomIndex].ticketNumber = "";
    }
  })();