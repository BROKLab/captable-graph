import { Bytes, dataSource, log } from "@graphprotocol/graph-ts";
import { ERC1400 } from "../generated/CapTableRegistry/ERC1400";
import {
  CapTable as CapTableSchema,
  TokenHolder,
  Balance,
} from "../generated/schema";
import {
  IssuedByPartition,
  RedeemedByPartition,
  TransferByPartition,
} from "../generated/templates/CapTable/ERC1400";

let context = dataSource.context();
let capTableRegistryId = context.getString("capTableRegistryId");
let capTableUuid = context.getString("capTableUuid");

export function handleIssuedByPartition(event: IssuedByPartition): void {
  let capTable = CapTableSchema.load(event.address.toBase58());
  if (capTable == null) {
    capTable = new CapTableSchema(event.address.toBase58());
  }
  let contract = ERC1400.bind(event.address);
  let owner = contract.owner();
  let partitionsBytes = contract.totalPartitions();
  let partitions: Array<String> = [];
  for (let i = 0; i < partitionsBytes.length; i++) {
    partitions.push(partitionsBytes[i].toString());
  }
  capTable.name = contract.name().toString();
  capTable.partitions = partitions;
  capTable.symbol = contract.symbol().toString();
  capTable.orgnr = capTableUuid.toString();
  capTable.minter = owner;
  capTable.status = "QUED";
  capTable.registry = capTableRegistryId;
  capTable.owner = owner;
  capTable.totalSupply = contract.totalSupply();
  let controllers = contract.controllers() as Array<Bytes>;
  if (controllers) {
    capTable.controllers = controllers;
  }
  capTable.save();
  // Token holder
  let tokenHolder = new TokenHolder(
    event.address.toBase58() + "-" + event.params.to.toBase58()
  );
  tokenHolder.address = event.params.to;
  tokenHolder.capTable = capTable.id;
  tokenHolder.save();
  //Balance
  let balance = new Balance(
    event.address.toBase58() +
      "-" +
      event.params.to.toBase58() +
      "-" +
      event.params.partition.toString()
  );
  balance.partition = event.params.partition.toString();
  balance.amount = event.params.value;
  balance.tokenHolder = tokenHolder.id;
  balance.save();
}

export function handleTransferByPartition(event: TransferByPartition): void {
  // fromTokenHolder balance adjustment
  let fromBalance = Balance.load(
    event.address.toBase58() +
      "-" +
      event.params.from.toBase58() +
      "-" +
      event.params.fromPartition.toString()
  );
  if (fromBalance == null) {
    log.critical("LOGICAL SMART CONTRACT ERROR {}", [
      "fromBalance in handleTransferByPartition should always exist. ",
    ]);
  }
  fromBalance.amount = fromBalance.amount.minus(event.params.value);
  fromBalance.save();

  // toTokenHolder balance adjustment
  let toBalance = Balance.load(
    event.address.toBase58() +
      "-" +
      event.params.to.toBase58() +
      "-" +
      event.params.fromPartition.toString()
  );
  if (toBalance) {
    toBalance.amount = toBalance.amount.plus(event.params.value);
    toBalance.save();
  } else {
    // if toBalance was not adjusted, it does not exist and we need to create it.
    let toTokenHolder = TokenHolder.load(
      event.address.toBase58() + "-" + event.params.to.toBase58()
    );
    if (toTokenHolder == null) {
      toTokenHolder = new TokenHolder(
        event.address.toBase58() + "-" + event.params.to.toBase58()
      );
      toTokenHolder.address = event.params.to;
      toTokenHolder.capTable = event.address.toBase58();
      toTokenHolder.save();
    }
    let toBalance = new Balance(
      event.address.toBase58() +
        "-" +
        event.params.to.toBase58() +
        "-" +
        event.params.fromPartition.toString()
    );
    toBalance.partition = event.params.fromPartition.toString();
    toBalance.amount = event.params.value;
    toBalance.tokenHolder = toTokenHolder.id;
    toBalance.save();
  }
}

export function handleRedeemByPartition(event: RedeemedByPartition): void {
  // fromTokenHolder balance adjustment
  let fromBalance = Balance.load(
    event.address.toBase58() +
      "-" +
      event.params.from.toBase58() +
      "-" +
      event.params.partition.toString()
  );
  if (fromBalance == null) {
    log.critical("LOGICAL SMART CONTRACT ERROR {}", [
      "fromBalance in handleRedeemByPartition should always exist. ",
    ]);
  }
  fromBalance.amount = fromBalance.amount.minus(event.params.value);
  fromBalance.save();
}
