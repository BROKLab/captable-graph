import { BigInt, DataSourceContext, log } from "@graphprotocol/graph-ts";
import {
  CapTableRegistry,
  capTableQued,
  capTableRemoved,
  capTableDeclined,
  capTableApproved,
} from "../generated/CapTableRegistry/CapTableRegistry";
import {
  CapTableRegistry as CapTableRegistrySchema,
  CapTable as CapTableSchema,
} from "../generated/schema";
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

  // let capTableQueContract = CapTableRegistry.bind(event.address);
  // let uuid = capTableQueContract.getUuid(event.address);

  // Start indexing the new capTable
  let context = new DataSourceContext();
  context.setString("capTableRegistryId", capTableRegistry.id);
  context.setString("capTableUuid", "qued_" + event.params.uuid.toString());
  CapTable.createWithContext(event.params.capTableAddress, context);
}

export function handleCapTableApproved(event: capTableApproved): void {
  let capTable = CapTableSchema.load(
    event.params.capTableAddress.toHexString()
  );
  if (capTable == null) {
    log.critical("LOGICAL SMART CONTRACT ERROR {}", [
      "capTable in handleCapTableApproved should always exist.",
    ]);
  }
  let seperatorIndex = capTable.orgnr.indexOf("_") + 1;
  capTable.orgnr = capTable.orgnr.slice(seperatorIndex);
  capTable.status = "APPROVED";
  capTable.save();
}
export function handlecapTableRemoved(event: capTableRemoved): void {
  let capTable = CapTableSchema.load(
    event.params.capTableAddress.toHexString()
  );
  if (capTable == null) {
    log.critical("LOGICAL SMART CONTRACT ERROR {}", [
      "capTable in handleCapTableApproved should always exist.",
    ]);
  }
  capTable.orgnr = "REMOVED_" + capTable.orgnr;
  capTable.status = "REMOVED";
  capTable.save();
}
export function handleCapTableDeclined(event: capTableDeclined): void {
  let capTable = CapTableSchema.load(
    event.params.capTableAddress.toHexString()
  );
  if (capTable == null) {
    log.critical("LOGICAL SMART CONTRACT ERROR {}", [
      "capTable in handleCapTableApproved should always exist.",
    ]);
  }
  let seperatorIndex = capTable.orgnr.indexOf("_");
  capTable.orgnr = capTable.orgnr.slice(seperatorIndex);
  capTable.orgnr = "DECLINED_" + capTable.orgnr;
  capTable.status = "DECLINED";
  capTable.save();
}
