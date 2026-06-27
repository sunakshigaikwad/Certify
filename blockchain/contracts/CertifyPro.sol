// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertifyPro {
    struct CertificateRecord {
        string certificateId;
        string pdfHash;
        uint256 timestamp;
        address issuer;
        bool isRevoked;
    }

    mapping(string => CertificateRecord) private certificates;
    address public owner;

    event CertificateIssued(string indexed certificateId, string pdfHash, uint256 timestamp, address indexed issuer);
    event CertificateRevoked(string indexed certificateId, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerCertificate(string memory _certificateId, string memory _pdfHash) public onlyOwner {
        require(certificates[_certificateId].timestamp == 0, "Certificate already exists");
        
        certificates[_certificateId] = CertificateRecord({
            certificateId: _certificateId,
            pdfHash: _pdfHash,
            timestamp: block.timestamp,
            issuer: msg.sender,
            isRevoked: false
        });

        emit CertificateIssued(_certificateId, _pdfHash, block.timestamp, msg.sender);
    }

    function getCertificate(string memory _certificateId) public view returns (
        string memory pdfHash,
        uint256 timestamp,
        address issuer,
        bool isValid
    ) {
        CertificateRecord memory cert = certificates[_certificateId];
        require(cert.timestamp > 0, "Certificate not found");
        return (cert.pdfHash, cert.timestamp, cert.issuer, !cert.isRevoked);
    }

    function verifyCertificate(string memory _certificateId, string memory _pdfHash) public view returns (bool) {
        CertificateRecord memory cert = certificates[_certificateId];
        if (cert.timestamp == 0 || cert.isRevoked) {
            return false;
        }
        return keccak256(abi.encodePacked(cert.pdfHash)) == keccak256(abi.encodePacked(_pdfHash));
    }

    function revokeCertificate(string memory _certificateId) public onlyOwner {
        require(certificates[_certificateId].timestamp > 0, "Certificate not found");
        require(!certificates[_certificateId].isRevoked, "Certificate already revoked");
        
        certificates[_certificateId].isRevoked = true;
        emit CertificateRevoked(_certificateId, block.timestamp);
    }
}
