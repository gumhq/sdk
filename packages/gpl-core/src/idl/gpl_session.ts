export type GplSession = {
  "version": "0.1.0",
  "name": "gpl_session",
  "instructions": [
    {
      "name": "createSession",
      "accounts": [
        {
          "name": "sessionToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sessionSigner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "targetProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK the target program is actually a program."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "topUp",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "validUntil",
          "type": {
            "option": "i64"
          }
        }
      ]
    },
    {
      "name": "revokeSession",
      "accounts": [
        {
          "name": "sessionToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
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
      "name": "sessionToken",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "targetProgram",
            "type": "publicKey"
          },
          {
            "name": "sessionSigner",
            "type": "publicKey"
          },
          {
            "name": "validUntil",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ValidityTooLong",
      "msg": "Requested validity is too long"
    }
  ]
};

export const IDL: GplSession = {
  "version": "0.1.0",
  "name": "gpl_session",
  "instructions": [
    {
      "name": "createSession",
      "accounts": [
        {
          "name": "sessionToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sessionSigner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "targetProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK the target program is actually a program."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "topUp",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "validUntil",
          "type": {
            "option": "i64"
          }
        }
      ]
    },
    {
      "name": "revokeSession",
      "accounts": [
        {
          "name": "sessionToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
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
      "name": "sessionToken",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "targetProgram",
            "type": "publicKey"
          },
          {
            "name": "sessionSigner",
            "type": "publicKey"
          },
          {
            "name": "validUntil",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ValidityTooLong",
      "msg": "Requested validity is too long"
    }
  ]
};
