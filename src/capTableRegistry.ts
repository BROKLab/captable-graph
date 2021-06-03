import { BigInt, DataSourceContext, log } from "@graphprotocol/graph-ts";
import {
  CapTableRegistry,
  capTableQued,
  capTableRemoved,
} from "../generated/CapTableRegistry/CapTableRegistry";
import { CapTableRegistry as CapTableRegistrySchema } from "../generated/schema";
import { CapTable } from "../generated/templates";

export function handleCapTableQued(event: capTableQued): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let capTableRegistry = CapTableRegistrySchema.load(event.address.toHex());
  log.info("My capTableRegistry value is: {}", [event.address.toHexString()]);
  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (capTableRegistry == null) {
    capTableRegistry = new CapTableRegistrySchema(event.address.toHex());

    // Entity fields can be set using simple assignments
    capTableRegistry.count = BigInt.fromI32(0);
    capTableRegistry.address = event.address;
  }

  capTableRegistry.count = capTableRegistry.count + BigInt.fromI32(1);
  capTableRegistry.save();

  let capTableQueContract = CapTableRegistry.bind(event.address);
  let uuid = capTableQueContract.getUuid(event.address);

  // Start indexing the new capTable
  let context = new DataSourceContext();
  context.setString("capTableRegistryId", capTableRegistry.id);
  context.setString("capTableUuid", event.params.uuid.toString());
  CapTable.createWithContext(event.params.capTableAddress, context);
}

export function handlecapTableRemoved(event: capTableRemoved): void {}
