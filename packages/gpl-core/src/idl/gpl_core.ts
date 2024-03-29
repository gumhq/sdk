export type GplCore = {
  "version": "1.0.0",
  "name": "gpl_core",
  "instructions": [
    {
      "name": "createProfile",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "profile",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "arg",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "path": "random_hash"
              }
            ]
          }
        },
        {
          "name": "screenName",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK that this PDA is either SNS, ANS or GPL Nameservice"
          ]
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "randomHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateProfile",
      "accounts": [
        {
          "name": "profile",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "profile.random_hash"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "screenName",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK that this PDA is either SNS, ANS or GPL Nameservice and is owned by the user"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteProfile",
      "accounts": [
        {
          "name": "profile",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "profile.random_hash"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "createPost",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "post",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "post"
              },
              {
                "kind": "arg",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "path": "random_hash"
              }
            ]
          }
        },
        {
          "name": "profile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        },
        {
          "name": "randomHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "updatePost",
      "accounts": [
        {
          "name": "post",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "post"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Post",
                "path": "post.random_hash"
              }
            ]
          },
          "relations": [
            "profile"
          ]
        },
        {
          "name": "profile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "createComment",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "post",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "post"
              },
              {
                "kind": "arg",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "path": "random_hash"
              }
            ]
          }
        },
        {
          "name": "profile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "replyTo",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "post"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Post",
                "path": "reply_to.random_hash"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        },
        {
          "name": "randomHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "deletePost",
      "accounts": [
        {
          "name": "post",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "post"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Post",
                "path": "post.random_hash"
              }
            ]
          },
          "relations": [
            "profile"
          ]
        },
        {
          "name": "profile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "refundReceiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createConnection",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "connection",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "connection"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "from_profile"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "to_profile"
              }
            ]
          }
        },
        {
          "name": "fromProfile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "from_profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "toProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deleteConnection",
      "accounts": [
        {
          "name": "connection",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "connection"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "from_profile"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "to_profile"
              }
            ]
          },
          "relations": [
            "from_profile",
            "to_profile"
          ]
        },
        {
          "name": "fromProfile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "from_profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "toProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "refundReceiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createReaction",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "reaction",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reaction"
              },
              {
                "kind": "arg",
                "type": "string",
                "path": "reaction_type"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Post",
                "path": "to_post"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "from_profile"
              }
            ]
          }
        },
        {
          "name": "toPost",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "fromProfile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "from_profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "reactionType",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteReaction",
      "accounts": [
        {
          "name": "reaction",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reaction"
              },
              {
                "kind": "account",
                "type": "string",
                "account": "Reaction",
                "path": "reaction.reaction_type"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Reaction",
                "path": "reaction.to_post"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Reaction",
                "path": "reaction.from_profile"
              }
            ]
          },
          "relations": [
            "to_post",
            "from_profile"
          ]
        },
        {
          "name": "toPost",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "fromProfile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "from_profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "refundReceiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createBadge",
      "accounts": [
        {
          "name": "badge",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "badge"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Issuer",
                "path": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Schema",
                "path": "schema"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "holder"
              }
            ]
          }
        },
        {
          "name": "issuer",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "authority"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "holder",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "holder.random_hash"
              }
            ]
          }
        },
        {
          "name": "schema",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "schema"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Schema",
                "path": "schema.random_hash"
              }
            ]
          }
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "CHECK the update_authority of the badge issuer"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateBadge",
      "accounts": [
        {
          "name": "badge",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "badge"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Issuer",
                "path": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Schema",
                "path": "schema"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Badge",
                "path": "badge.holder"
              }
            ]
          },
          "relations": [
            "issuer",
            "schema"
          ]
        },
        {
          "name": "issuer",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Issuer",
                "path": "issuer.authority"
              }
            ]
          }
        },
        {
          "name": "schema",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "schema"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Schema",
                "path": "schema.random_hash"
              }
            ]
          }
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "burnBadge",
      "accounts": [
        {
          "name": "badge",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "badge"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Issuer",
                "path": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Schema",
                "path": "schema"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "holder"
              }
            ]
          },
          "relations": [
            "issuer",
            "holder",
            "schema"
          ]
        },
        {
          "name": "holder",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "holder.random_hash"
              }
            ]
          }
        },
        {
          "name": "issuer",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Issuer",
                "path": "issuer.authority"
              }
            ]
          }
        },
        {
          "name": "schema",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "schema"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Schema",
                "path": "schema.random_hash"
              }
            ]
          }
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "createIssuer",
      "accounts": [
        {
          "name": "issuer",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "verifyIssuer",
      "accounts": [
        {
          "name": "issuer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "deleteIssuer",
      "accounts": [
        {
          "name": "issuer",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "authority"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "createSchema",
      "accounts": [
        {
          "name": "schema",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "schema"
              },
              {
                "kind": "arg",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "path": "random_hash"
              }
            ]
          }
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        },
        {
          "name": "randomHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "updateSchema",
      "accounts": [
        {
          "name": "schema",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "schema"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Schema",
                "path": "schema.random_hash"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteSchema",
      "accounts": [
        {
          "name": "schema",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "schema"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Schema",
                "path": "schema.random_hash"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "badge",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "issuer",
            "type": "publicKey"
          },
          {
            "name": "holder",
            "type": "publicKey"
          },
          {
            "name": "updateAuthority",
            "type": "publicKey"
          },
          {
            "name": "schema",
            "type": "publicKey"
          },
          {
            "name": "metadataUri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "issuer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "verified",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "schema",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "metadataUri",
            "type": "string"
          },
          {
            "name": "randomHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "connection",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fromProfile",
            "type": "publicKey"
          },
          {
            "name": "toProfile",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "post",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "profile",
            "type": "publicKey"
          },
          {
            "name": "metadataUri",
            "type": "string"
          },
          {
            "name": "randomHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "replyTo",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "profile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "metadataUri",
            "type": "string"
          },
          {
            "name": "screenName",
            "type": "publicKey"
          },
          {
            "name": "randomHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "reaction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fromProfile",
            "type": "publicKey"
          },
          {
            "name": "toPost",
            "type": "publicKey"
          },
          {
            "name": "reactionType",
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PostError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "URITooLong"
          }
        ]
      }
    },
    {
      "name": "ProfileMetadataError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "URITooLong"
          }
        ]
      }
    },
    {
      "name": "ConnectionError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "CannotConnectToSelf"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "ProfileNew",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "randomHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "screenName",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "metadataUri",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "ProfileUpdated",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "screenName",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "metadataUri",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "ProfileDeleted",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "screenName",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "metadataUri",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "PostNew",
      "fields": [
        {
          "name": "post",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "randomHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        },
        {
          "name": "metadataUri",
          "type": "string",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "PostUpdated",
      "fields": [
        {
          "name": "post",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "metadataUri",
          "type": "string",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "PostDeleted",
      "fields": [
        {
          "name": "post",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "PostCommentNew",
      "fields": [
        {
          "name": "post",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "randomHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        },
        {
          "name": "metadataUri",
          "type": "string",
          "index": false
        },
        {
          "name": "replyTo",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ConnectionNew",
      "fields": [
        {
          "name": "connection",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "fromProfile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "toProfile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ConnectionDeleted",
      "fields": [
        {
          "name": "connection",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "fromProfile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "toProfile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ReactionNew",
      "fields": [
        {
          "name": "reaction",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "reactionType",
          "type": "string",
          "index": false
        },
        {
          "name": "fromProfile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "toPost",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ReactionDeleted",
      "fields": [
        {
          "name": "reaction",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "reactionType",
          "type": "string",
          "index": false
        },
        {
          "name": "fromProfile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "toPost",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "URITooLong"
    },
    {
      "code": 6001,
      "name": "CannotConnectToSelf"
    },
    {
      "code": 6002,
      "name": "UnauthorizedSigner"
    },
    {
      "code": 6003,
      "name": "UnverifiedIssuer"
    },
    {
      "code": 6004,
      "name": "InvalidSignerToVerify"
    },
    {
      "code": 6005,
      "name": "ReactionTypeTooLong"
    }
  ]
};

export const IDL: GplCore = {
  "version": "1.0.0",
  "name": "gpl_core",
  "instructions": [
    {
      "name": "createProfile",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "profile",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "arg",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "path": "random_hash"
              }
            ]
          }
        },
        {
          "name": "screenName",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK that this PDA is either SNS, ANS or GPL Nameservice"
          ]
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "randomHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateProfile",
      "accounts": [
        {
          "name": "profile",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "profile.random_hash"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "screenName",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK that this PDA is either SNS, ANS or GPL Nameservice and is owned by the user"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteProfile",
      "accounts": [
        {
          "name": "profile",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "profile.random_hash"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "createPost",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "post",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "post"
              },
              {
                "kind": "arg",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "path": "random_hash"
              }
            ]
          }
        },
        {
          "name": "profile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        },
        {
          "name": "randomHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "updatePost",
      "accounts": [
        {
          "name": "post",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "post"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Post",
                "path": "post.random_hash"
              }
            ]
          },
          "relations": [
            "profile"
          ]
        },
        {
          "name": "profile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "createComment",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "post",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "post"
              },
              {
                "kind": "arg",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "path": "random_hash"
              }
            ]
          }
        },
        {
          "name": "profile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "replyTo",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "post"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Post",
                "path": "reply_to.random_hash"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        },
        {
          "name": "randomHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "deletePost",
      "accounts": [
        {
          "name": "post",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "post"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Post",
                "path": "post.random_hash"
              }
            ]
          },
          "relations": [
            "profile"
          ]
        },
        {
          "name": "profile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "refundReceiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createConnection",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "connection",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "connection"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "from_profile"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "to_profile"
              }
            ]
          }
        },
        {
          "name": "fromProfile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "from_profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "toProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deleteConnection",
      "accounts": [
        {
          "name": "connection",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "connection"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "from_profile"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "to_profile"
              }
            ]
          },
          "relations": [
            "from_profile",
            "to_profile"
          ]
        },
        {
          "name": "fromProfile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "from_profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "toProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "refundReceiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createReaction",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "reaction",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reaction"
              },
              {
                "kind": "arg",
                "type": "string",
                "path": "reaction_type"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Post",
                "path": "to_post"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "from_profile"
              }
            ]
          }
        },
        {
          "name": "toPost",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "fromProfile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "from_profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "reactionType",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteReaction",
      "accounts": [
        {
          "name": "reaction",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "reaction"
              },
              {
                "kind": "account",
                "type": "string",
                "account": "Reaction",
                "path": "reaction.reaction_type"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Reaction",
                "path": "reaction.to_post"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Reaction",
                "path": "reaction.from_profile"
              }
            ]
          },
          "relations": [
            "to_post",
            "from_profile"
          ]
        },
        {
          "name": "toPost",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "fromProfile",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "from_profile.random_hash"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "refundReceiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createBadge",
      "accounts": [
        {
          "name": "badge",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "badge"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Issuer",
                "path": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Schema",
                "path": "schema"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "holder"
              }
            ]
          }
        },
        {
          "name": "issuer",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "authority"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "holder",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "holder.random_hash"
              }
            ]
          }
        },
        {
          "name": "schema",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "schema"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Schema",
                "path": "schema.random_hash"
              }
            ]
          }
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "CHECK the update_authority of the badge issuer"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateBadge",
      "accounts": [
        {
          "name": "badge",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "badge"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Issuer",
                "path": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Schema",
                "path": "schema"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Badge",
                "path": "badge.holder"
              }
            ]
          },
          "relations": [
            "issuer",
            "schema"
          ]
        },
        {
          "name": "issuer",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Issuer",
                "path": "issuer.authority"
              }
            ]
          }
        },
        {
          "name": "schema",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "schema"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Schema",
                "path": "schema.random_hash"
              }
            ]
          }
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "burnBadge",
      "accounts": [
        {
          "name": "badge",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "badge"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Issuer",
                "path": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Schema",
                "path": "schema"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "holder"
              }
            ]
          },
          "relations": [
            "issuer",
            "holder",
            "schema"
          ]
        },
        {
          "name": "holder",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Profile",
                "path": "holder.random_hash"
              }
            ]
          }
        },
        {
          "name": "issuer",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Issuer",
                "path": "issuer.authority"
              }
            ]
          }
        },
        {
          "name": "schema",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "schema"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Schema",
                "path": "schema.random_hash"
              }
            ]
          }
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "createIssuer",
      "accounts": [
        {
          "name": "issuer",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "verifyIssuer",
      "accounts": [
        {
          "name": "issuer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "deleteIssuer",
      "accounts": [
        {
          "name": "issuer",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "issuer"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "authority"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "createSchema",
      "accounts": [
        {
          "name": "schema",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "schema"
              },
              {
                "kind": "arg",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "path": "random_hash"
              }
            ]
          }
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        },
        {
          "name": "randomHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "updateSchema",
      "accounts": [
        {
          "name": "schema",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "schema"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Schema",
                "path": "schema.random_hash"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteSchema",
      "accounts": [
        {
          "name": "schema",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "schema"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "Schema",
                "path": "schema.random_hash"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "badge",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "issuer",
            "type": "publicKey"
          },
          {
            "name": "holder",
            "type": "publicKey"
          },
          {
            "name": "updateAuthority",
            "type": "publicKey"
          },
          {
            "name": "schema",
            "type": "publicKey"
          },
          {
            "name": "metadataUri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "issuer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "verified",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "schema",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "metadataUri",
            "type": "string"
          },
          {
            "name": "randomHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "connection",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fromProfile",
            "type": "publicKey"
          },
          {
            "name": "toProfile",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "post",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "profile",
            "type": "publicKey"
          },
          {
            "name": "metadataUri",
            "type": "string"
          },
          {
            "name": "randomHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "replyTo",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "profile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "metadataUri",
            "type": "string"
          },
          {
            "name": "screenName",
            "type": "publicKey"
          },
          {
            "name": "randomHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "reaction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fromProfile",
            "type": "publicKey"
          },
          {
            "name": "toPost",
            "type": "publicKey"
          },
          {
            "name": "reactionType",
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PostError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "URITooLong"
          }
        ]
      }
    },
    {
      "name": "ProfileMetadataError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "URITooLong"
          }
        ]
      }
    },
    {
      "name": "ConnectionError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "CannotConnectToSelf"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "ProfileNew",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "randomHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "screenName",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "metadataUri",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "ProfileUpdated",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "screenName",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "metadataUri",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "ProfileDeleted",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "screenName",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "metadataUri",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "PostNew",
      "fields": [
        {
          "name": "post",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "randomHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        },
        {
          "name": "metadataUri",
          "type": "string",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "PostUpdated",
      "fields": [
        {
          "name": "post",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "metadataUri",
          "type": "string",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "PostDeleted",
      "fields": [
        {
          "name": "post",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "PostCommentNew",
      "fields": [
        {
          "name": "post",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "randomHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        },
        {
          "name": "metadataUri",
          "type": "string",
          "index": false
        },
        {
          "name": "replyTo",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ConnectionNew",
      "fields": [
        {
          "name": "connection",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "fromProfile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "toProfile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ConnectionDeleted",
      "fields": [
        {
          "name": "connection",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "fromProfile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "toProfile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ReactionNew",
      "fields": [
        {
          "name": "reaction",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "reactionType",
          "type": "string",
          "index": false
        },
        {
          "name": "fromProfile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "toPost",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ReactionDeleted",
      "fields": [
        {
          "name": "reaction",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "reactionType",
          "type": "string",
          "index": false
        },
        {
          "name": "fromProfile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "toPost",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "URITooLong"
    },
    {
      "code": 6001,
      "name": "CannotConnectToSelf"
    },
    {
      "code": 6002,
      "name": "UnauthorizedSigner"
    },
    {
      "code": 6003,
      "name": "UnverifiedIssuer"
    },
    {
      "code": 6004,
      "name": "InvalidSignerToVerify"
    },
    {
      "code": 6005,
      "name": "ReactionTypeTooLong"
    }
  ]
};
