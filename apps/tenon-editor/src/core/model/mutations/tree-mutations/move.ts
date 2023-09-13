import { RuntimeTreeNode } from "../../data-structure";
import { MutationError } from "../../errors";
import { BaseMutation } from "../base";

export class MoveTreeNodeMutation extends BaseMutation {
  oldParent: RuntimeTreeNode;
  newParent: RuntimeTreeNode;
  oldIndex: number;
  newIndex: number;
  source: RuntimeTreeNode;

  constructor(newParent: RuntimeTreeNode, source: RuntimeTreeNode, index: number) {
    super();
    if (!source.parent) {
      throw new MutationError(
        "Cannot move a node that does not have a parent"
      );
    }
    this.oldParent = source.parent;
    this.newParent = newParent;
    this.oldIndex = source.parent.children.indexOf(source) ?? -1;
    this.newIndex = index;
    this.source = source;
  }

  handle(): void {
    // remove from old parent
    this.oldParent.children.splice(this.oldIndex, 1);
    // insert to new parent
    if (this.oldParent === this.newParent && this.oldIndex < this.newIndex) {
      // if the old parent equals to the new parent
      // and the new index is larger than the old index
      // we need to minus 1 cause the old index is already removed
      this.newParent.children.splice(this.newIndex - 1, 0, this.source);
    } else {
      // if the old parent is not equal to the new parent
      // we just insert the node to the new parent
      this.newParent.children.splice(this.newIndex, 0, this.source);
      this.source.parent = this.newParent;
    }
  }

  reverse(): BaseMutation {
    return new MoveTreeNodeMutation(this.oldParent, this.source, this.oldIndex);
  }
}
