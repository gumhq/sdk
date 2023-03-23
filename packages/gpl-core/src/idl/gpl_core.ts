export type GplCore = {
  "version": "0.1.0",
  "name": "gpl_core",
  "instructions": [
    {
      "name": "createUser",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
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
      "name": "updateUser",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "newAuthority",
          "isMut": false,
          "isSigner": false
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
      "name": "deleteUser",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
      "name": "createProfile",
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
                "kind": "arg",
                "type": "string",
                "path": "namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "namespace",
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "profile.user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
      "name": "createProfileMetadata",
      "accounts": [
        {
          "name": "profileMetadata",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile_metadata"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "profile"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
      "name": "updateProfileMetadata",
      "accounts": [
        {
          "name": "profileMetadata",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile_metadata"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "profile"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
      "name": "deleteProfileMetadata",
      "accounts": [
        {
          "name": "profileMetadata",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile_metadata"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "profile"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
      "name": "createPost",
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "from_profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "from_profile.user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "toProfile",
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "to_profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "to_profile.user"
              }
            ]
          }
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "from_profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "from_profile.user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "toProfile",
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "to_profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "to_profile.user"
              }
            ]
          }
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
      "name": "createReaction",
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
                "path": "to_post.random_hash"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "from_profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
                "type": {
                  "defined": "ReactionType"
                },
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
                "path": "to_post.random_hash"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "from_profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
    }
  ],
  "accounts": [
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
      "name": "profileMetadata",
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
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "namespace",
            "type": {
              "defined": "Namespace"
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
            "type": {
              "defined": "ReactionType"
            }
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
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
    }
  ],
  "types": [
    {
      "name": "GumError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "PostError"
          },
          {
            "name": "ProfileError"
          },
          {
            "name": "UserError"
          },
          {
            "name": "ReactionError"
          },
          {
            "name": "ConnectionError"
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
    },
    {
      "name": "Namespace",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Professional"
          },
          {
            "name": "Personal"
          },
          {
            "name": "Gaming"
          },
          {
            "name": "Degen"
          }
        ]
      }
    },
    {
      "name": "ReactionType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Like"
          },
          {
            "name": "Dislike"
          },
          {
            "name": "Love"
          },
          {
            "name": "Haha"
          },
          {
            "name": "Wow"
          },
          {
            "name": "Sad"
          },
          {
            "name": "Angry"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "UserNew",
      "fields": [
        {
          "name": "user",
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
          "name": "authority",
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
      "name": "UserAuthorityChanged",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newAuthority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldAuthority",
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
      "name": "UserDeleted",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
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
      "name": "ProfileNew",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "namespace",
          "type": {
            "defined": "Namespace"
          },
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
      "name": "ProfileDeleted",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "namespace",
          "type": {
            "defined": "Namespace"
          },
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
          "name": "user",
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
          "name": "user",
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
          "name": "user",
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
          "name": "user",
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
          "name": "user",
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
          "name": "user",
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
          "type": {
            "defined": "ReactionType"
          },
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
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
          "type": {
            "defined": "ReactionType"
          },
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
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
      "name": "ProfileMetadataNew",
      "fields": [
        {
          "name": "profileMetadata",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
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
      "name": "ProfileMetadataUpdated",
      "fields": [
        {
          "name": "profileMetadata",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
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
      "name": "ProfileMetadataDeleted",
      "fields": [
        {
          "name": "profileMetadata",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
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
    }
  ]
};

export const IDL: GplCore = {
  "version": "0.1.0",
  "name": "gpl_core",
  "instructions": [
    {
      "name": "createUser",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
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
      "name": "updateUser",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "newAuthority",
          "isMut": false,
          "isSigner": false
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
      "name": "deleteUser",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
      "name": "createProfile",
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
                "kind": "arg",
                "type": "string",
                "path": "namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "namespace",
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "profile.user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
      "name": "createProfileMetadata",
      "accounts": [
        {
          "name": "profileMetadata",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile_metadata"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "profile"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
      "name": "updateProfileMetadata",
      "accounts": [
        {
          "name": "profileMetadata",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile_metadata"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "profile"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
      "name": "deleteProfileMetadata",
      "accounts": [
        {
          "name": "profileMetadata",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "profile_metadata"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "profile"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
      "name": "createPost",
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "from_profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "from_profile.user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "toProfile",
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "to_profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "to_profile.user"
              }
            ]
          }
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "from_profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "from_profile.user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "toProfile",
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "to_profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Profile",
                "path": "to_profile.user"
              }
            ]
          }
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
      "name": "createReaction",
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
                "path": "to_post.random_hash"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "from_profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
                "type": {
                  "defined": "ReactionType"
                },
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
                "path": "to_post.random_hash"
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
                  "defined": "Namespace"
                },
                "account": "Profile",
                "path": "from_profile.namespace"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "User",
                "path": "user"
              }
            ]
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "user"
              },
              {
                "kind": "account",
                "type": {
                  "array": [
                    "u8",
                    32
                  ]
                },
                "account": "User",
                "path": "user.random_hash"
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
    }
  ],
  "accounts": [
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
      "name": "profileMetadata",
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
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "namespace",
            "type": {
              "defined": "Namespace"
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
            "type": {
              "defined": "ReactionType"
            }
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
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
    }
  ],
  "types": [
    {
      "name": "GumError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "PostError"
          },
          {
            "name": "ProfileError"
          },
          {
            "name": "UserError"
          },
          {
            "name": "ReactionError"
          },
          {
            "name": "ConnectionError"
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
    },
    {
      "name": "Namespace",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Professional"
          },
          {
            "name": "Personal"
          },
          {
            "name": "Gaming"
          },
          {
            "name": "Degen"
          }
        ]
      }
    },
    {
      "name": "ReactionType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Like"
          },
          {
            "name": "Dislike"
          },
          {
            "name": "Love"
          },
          {
            "name": "Haha"
          },
          {
            "name": "Wow"
          },
          {
            "name": "Sad"
          },
          {
            "name": "Angry"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "UserNew",
      "fields": [
        {
          "name": "user",
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
          "name": "authority",
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
      "name": "UserAuthorityChanged",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newAuthority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldAuthority",
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
      "name": "UserDeleted",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
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
      "name": "ProfileNew",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "namespace",
          "type": {
            "defined": "Namespace"
          },
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
      "name": "ProfileDeleted",
      "fields": [
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "namespace",
          "type": {
            "defined": "Namespace"
          },
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
          "name": "user",
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
          "name": "user",
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
          "name": "user",
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
          "name": "user",
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
          "name": "user",
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
          "name": "user",
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
          "type": {
            "defined": "ReactionType"
          },
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
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
          "type": {
            "defined": "ReactionType"
          },
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
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
      "name": "ProfileMetadataNew",
      "fields": [
        {
          "name": "profileMetadata",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
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
      "name": "ProfileMetadataUpdated",
      "fields": [
        {
          "name": "profileMetadata",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
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
      "name": "ProfileMetadataDeleted",
      "fields": [
        {
          "name": "profileMetadata",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "profile",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
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
    }
  ]
};
