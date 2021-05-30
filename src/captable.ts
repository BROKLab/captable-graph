import { Bytes, dataSource, log } from "@graphprotocol/graph-ts";
import { ERC1400 } from "../generated/CapTableRegistry/ERC1400";
import { CapTable as CapTableSchema } from "../generated/schema";
import {
  IssuedByPartition,
  TransferByPartition,
} from "../generated/templates/CapTable/ERC1400";

let context = dataSource.context();
let capTableRegistryId = context.getString("capTableRegistryId");
let capTableUuid = context.getString("capTableUuid");

export function handleIssuedByPartition(event: IssuedByPartition): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let capTable = CapTableSchema.load(event.address.toHex());

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  log.info("My value is: {}", [event.address.toHex()]);
  if (capTable == null) {
    capTable = new CapTableSchema(event.address.toHex());
  }
  let contract = ERC1400.bind(event.address);

  capTable.active = true;
  capTable.orgnr = capTableUuid;
  capTable.minter = contract.owner();
  capTable.registry = capTableRegistryId;
  capTable.owner = contract.owner();
  capTable.totalSupply = contract.totalSupply();
  let controllers = contract.controllers() as Array<Bytes>;
  if (controllers) {
    capTable.controllers = controllers;
  }
  capTable.tokenBalances = [];
  capTable.save();
}

export function handleTransferByPartition(event: TransferByPartition): void {
  //   let capTable = CapTableSchema.load(event.address.toHex());
  //   log.info("My value is: {}", [event.address.toHex()]);
  //   if (capTable == null) {
  //     capTable = new CapTableSchema(event.address.toHex());
  //   }
  //   let contract = ERC1400.bind(event.address);
  //   capTable.active = true;
  //   capTable.orgnr = capTableUuid;
  //   capTable.minter = contract.owner();
  //   capTable.registry = capTableRegistryId;
  //   capTable.owner = contract.owner();
  //   capTable.totalSupply = contract.totalSupply();
  //   let controllers = contract.controllers() as Array<Bytes>;
  //   if (controllers) {
  //     capTable.controllers = controllers;
  //   }
  //   capTable.tokenBalances = [];
  //   capTable.save();
}
