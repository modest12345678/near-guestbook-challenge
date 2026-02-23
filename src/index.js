import { NearBindgen, near, call, view, Vector } from 'near-sdk-js';

class Signature {
  constructor({ account_id, message, timestamp }) {
    this.account_id = account_id;
    this.message = message;
    this.timestamp = timestamp;
  }
}

@NearBindgen({})
class GuestBook {
  signatures = new Vector('s');

  @call({})
  sign({ message }) {
    const account_id = near.signerAccountId();
    const timestamp = near.blockTimestamp().toString();
    const signature = new Signature({ account_id, message, timestamp });
    this.signatures.push(signature);
    near.log(`Guestbook signed by ${account_id}`);
  }

  @view({})
  get_signatures({ from_index = 0, limit = 10 }) {
    return this.signatures.toArray().slice(from_index, from_index + limit);
  }

  @view({})
  get_signature_count() {
    return this.signatures.length;
  }

  @call({ payableFunction: true })
  delete_signature({ index }) {
    // Extra Feature: Delete own signature (judging points)
    const account_id = near.signerAccountId();
    const signature = this.signatures.get(index);
    if (signature && signature.account_id === account_id) {
      this.signatures.replace(index, new Signature({ account_id: "deleted", message: "Signature removed by user", timestamp: "0" }));
    }
  }
}
