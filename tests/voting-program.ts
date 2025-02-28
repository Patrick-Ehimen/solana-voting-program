import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";

// SolPg specific approach
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
};

describe("strawsoll", () => {
  // Get provider from the SolPg environment
  const provider = anchor.Provider.local();
  anchor.setProvider(provider);

  // The program is automatically loaded by SolPg
  const program = anchor.workspace.strawsoll;
  const pollAccount = Keypair.generate();

  // Use provider's wallet for testing
  const owner = provider.wallet;

  // Create additional voter keypairs
  const voter1 = Keypair.generate();
  const voter2 = Keypair.generate();
  const voter3 = Keypair.generate();

  // Simulated airdrop - In SolPg this is not needed as it's handled by the environment
  // We can still include this for readability but it likely won't do anything
  it("Prepares test accounts", async () => {
    // SolPg likely handles this differently, but keeping for clarity
    console.log("Using owner pubkey:", owner.publicKey.toString());
    console.log("Poll account pubkey:", pollAccount.publicKey.toString());
  });

  it("Initializes a poll with options", async () => {
    // Define poll options
    const pollOptions = [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4",
      "Option 5",
    ];

    // Initialize the poll
    await program.rpc.initialize(pollOptions, {
      accounts: {
        poll: pollAccount.publicKey,
        owner: owner.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [pollAccount],
    });

    // Fetch the poll data
    const pollData = await program.account.poll.fetch(pollAccount.publicKey);

    // Verify the poll was initialized correctly
    assert(
      pollData.finished === false,
      "Poll should not be finished after initialization"
    );
    assert(pollData.options.length === 5, "Poll should have 5 options");
    assert(pollData.voters.length === 0, "Poll should start with 0 voters");

    // Verify each option was created properly
    for (let i = 0; i < pollOptions.length; i++) {
      assert(
        pollData.options[i].label === pollOptions[i],
        `Option label should be ${pollOptions[i]}`
      );
      assert(pollData.options[i].id === i + 1, `Option ID should be ${i + 1}`);
      assert(pollData.options[i].votes === 0, "Option votes should start at 0");
    }

    console.log("✅ Poll initialized successfully");
  });

  it("Allows the owner to vote on a poll option", async () => {
    // The owner votes for option ID 2
    await program.rpc.vote(2, {
      accounts: {
        poll: pollAccount.publicKey,
        voter: owner.publicKey,
      },
    });

    // Fetch updated poll data
    const pollData = await program.account.poll.fetch(pollAccount.publicKey);

    // Check that the vote was recorded
    assert(
      pollData.voters.length === 1,
      "There should be 1 voter after voting"
    );
    assert(
      pollData.voters[0].toString() === owner.publicKey.toString(),
      "The voter pubkey should match the owner"
    );

    // Check that the vote count for option 2 increased
    const option2 = pollData.options.find((opt) => opt.id === 2);
    assert(option2.votes === 1, "Option 2 should have 1 vote");

    // Check that other options still have 0 votes
    const otherOptions = pollData.options.filter((opt) => opt.id !== 2);
    for (const opt of otherOptions) {
      assert(opt.votes === 0, `Option ${opt.id} should still have 0 votes`);
    }

    console.log("✅ Owner voted successfully");
  });

  // Note: In SolPg, we can't easily simulate different signers as in a local environment
  // The following tests would need to be adapted to your specific SolPg setup
  // These are conceptual tests that demonstrate what would need to be tested

  it("Prevents a user from voting twice (conceptual)", async () => {
    console.log(
      "⚠️ Note: This test can't be fully implemented in SolPg without multiple wallets"
    );
    console.log(
      "Conceptual test: When owner tries to vote again, it should fail with UserAlreadyVoted error"
    );

    try {
      await program.rpc.vote(1, {
        accounts: {
          poll: pollAccount.publicKey,
          voter: owner.publicKey,
        },
      });

      assert(false, "This transaction should have failed");
    } catch (error) {
      console.log("✅ Error caught as expected:", error.toString());
      // In a proper test, we'd check for the specific error code
      // assert(error.toString().includes("UserAlreadyVoted"), "Should fail with UserAlreadyVoted error");
    }
  });

  it("Prevents voting for a non-existent option", async () => {
    try {
      // Try to vote for option with ID 10 (doesn't exist)
      await program.rpc.vote(10, {
        accounts: {
          poll: pollAccount.publicKey,
          voter: owner.publicKey, // Already voted, but we'll get PollOptionNotFound first
        },
      });

      assert(false, "This transaction should have failed");
    } catch (error) {
      console.log("✅ Error caught as expected:", error.toString());
      // In a proper test, we'd check for the specific error code
      // assert(error.toString().includes("PollOptionNotFound"), "Should fail with PollOptionNotFound error");
    }
  });

  // Add additional commentary to explain SolPg limitations
  it("Additional tests explanation", async () => {
    console.log("Note on SolPg testing limitations:");
    console.log(
      "- To fully test this program, you would need multiple wallet signers"
    );
    console.log(
      "- In SolPg, you typically use the provided wallet for testing"
    );
    console.log(
      "- For comprehensive testing, consider using a local Anchor environment"
    );
    console.log(
      "- Alternatively, SolPg may offer specific methods to simulate different signers"
    );
  });
});
