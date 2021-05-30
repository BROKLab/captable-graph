import { BigInt, Bytes, DataSourceContext, log } from "@graphprotocol/graph-ts";
import {
  CapTableRegistry,
  capTableAdded,
  capTableRemoved,
} from "../generated/CapTableRegistry/CapTableRegistry";
import { CapTableRegistry as CapTableRegistrySchema } from "../generated/schema";
import { CapTable } from "../generated/templates";

export function handleCapTableAdded(event: capTableAdded): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let capTableRegistry = CapTableRegistrySchema.load(event.address.toHex());
  log.info("My registry value is: {}", [event.address.toHexString()]);
  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (capTableRegistry == null) {
    capTableRegistry = new CapTableRegistrySchema(event.address.toHex());

    // Entity fields can be set using simple assignments
    capTableRegistry.count = BigInt.fromI32(0);
    capTableRegistry.address = event.address;
  }

  capTableRegistry.count = capTableRegistry.count + BigInt.fromI32(1);

  // get uuid
  let capTableRegistryContract = CapTableRegistry.bind(event.address);
  let info = capTableRegistryContract.info(event.params.capTableAddress);

  // Start indexing the new capTable
  let context = new DataSourceContext();
  context.setString("capTableRegistryId", capTableRegistry.id);
  context.setString("capTableUuid", info.value0.toString());
  CapTable.createWithContext(event.params.capTableAddress, context);

  // let capTables = capTableRegistry.capTables;
  // capTables.push(event.params.capTableAddress.toString());
  // capTableRegistry.capTables = capTables;

  capTableRegistry.save();
}

export function handlecapTableRemoved(event: capTableRemoved): void {}
