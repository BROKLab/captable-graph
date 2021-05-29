import { BigInt } from "@graphprotocol/graph-ts";
import {
  CapTableRegistry,
  capTableAdded,
  capTableRemoved,
} from "../generated/CapTableRegistry/CapTableRegistry";
import { ERC1400 } from "../generated/CapTableRegistry/ERC1400";
import { CapTableRegistry as CapTableRegistrySchema } from "../generated/schema";
import { CapTable as CapTableSchema } from "../generated/schema";

export function handlecapTableAdded(event: capTableAdded): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let capTableRegistry = CapTableRegistrySchema.load(event.address.toHex());

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (capTableRegistry == null) {
    capTableRegistry = new CapTableRegistrySchema(event.address.toHex());

    // Entity fields can be set using simple assignments
    capTableRegistry.count = BigInt.fromI32(0);
  }

  // BigInt and BigDecimal math are supported
  capTableRegistry.count = capTableRegistry.count + BigInt.fromI32(1);

  // Entity fields can be set based on event parameters
  let capTable = new CapTableSchema(event.params.capTableAddress.toHex());
  let erc1400Contract = ERC1400.bind(event.params.capTableAddress);
  let capTableRegistryContract = CapTableRegistry.bind(event.address);
  let info = capTableRegistryContract.info(event.params.capTableAddress);

  capTable.active = true;
  capTable.orgnr = info.value0.toString();
  capTable.minter = erc1400Contract.owner();
  capTable.registry = capTableRegistry.id;
  capTable.totalSupply = erc1400Contract.totalSupply();
  capTable.controllers = erc1400Contract.controllers();
  capTable.tokenBalances = [];

  // Entities can be written to the store with `.save()`
  capTableRegistry.save();

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.controllers(...)
  // - contract.info(...)
  // - contract.isController(...)
  // - contract.list(...)
  // - contract.listActive(...)
}

export function handlecapTableRemoved(event: capTableRemoved): void {}
