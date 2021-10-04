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
let capTableId = context.getString("capTableId");
