# Lab Session 1: Symmetric or secret-key cryptography

Sergio Giménez
Network Security, September 2021

## Pre Exercise

Create RSA public and private keys for Alice and Bob and exchange the public ones.

```source
kali@alice:~$ openssl genrsa -out privA.pem 4096
```

The public key can be derived from the private key. However, if we want them separate we can do so by running:

```source
kale@alice:~$ openssl rsa -in privA.pem -pubout -out pubA.pem
```

We do the exact same thing for Bob.

In order to exchange the keys we will use scp. To do so make sure that the two VMs are in the same NATNetwork and can be seen between them.

Now send Alice public key to Bob and vice versa:

```source
kali@alice:~$ scp pubA.pem kali@10.0.2.12:~
```
> Usually the ssh daemon is not running and `scp` won't work. If that happens, start the daemon by running: `sudo systemctl start ssh`


## Exercise 1

**Make Alice send a big image to Bob in a confidential manner.**

As specified in the exercise, the size image is greater than the RSA modulus. That means that it can not be encrypted in plain RSA. We need to find an alternative way. A possible approach is to encode the image in chunks of size `n`, where `n` is the RSA modulus. However, this might be a bit overkill.  
Another possible more efficient approach is to encode the image using a `(IV, key)` tuple as seen in  previous sections. Then, the tuple is written in a text file, and it is sent to Bob with RSA encryption using Bob's public key. Finally, Bob can decode the image because he has the necessary tuple `(IV, key)` to decrypt the image.

1. Alice creates a one time key and an IV to encrypt the image.

    * `MSG_KEY=$(openssl rand -hex 32)` for creating the key and save it in a variable for convenience.
  
    * `IV_KEY=$(openssl rand -hex 16)` for creating the IV.

2. The next step consists of encode the image using `AES-256-CBC` as with the same idea shown in section 1.2.1. In Alice's terminal, encode the image using `AES-256-CBC`:

    ```source
    openssl enc -aes-256-cbc -in img_to_enc.jpg -out encrypted_img -K $MSG_KEY -iv $IV_KEY
    ```

3. Now we will use Bob's public key to encrypt a text file with the tuple `(IV, key)` for its posterior decryption.

    * In Alice, create a TXT file with the keys and IVs

        ```source
        printf "$MSG_KEY\n$IV_KEY" > tuple.txt 
        ```

    * In Alice, encrypt the file using RSA with Bob's public key:

        ```source
        openssl rsautl -encrypt -in tuple.txt -out encrypted_tuple.txt -pubin -inkey bob_public_key.pem
        ```

    * Then, in Alice, send the files to Bob (e.g. using SCP):

        ```source
        scp encrypted_tuple.txt kali@10.0.2.15:/home/kali
        scp encrypted_img.txt kali@10.0.2.15:/home/kali
        ```

3. Bob can decrypt the tuple and use it to decrypt the image. 

   * First, it needs to decrypt the `(IV, key)` tuple using his private key:

        ```source
        openssl rsautl -decrypt -in encrypted_tuple.txt -inkey privB.pem -out tuple.txt
        ```

    * Verify it works:

        ```source
        $ cat tuple.txt 
        7bf3822c42e0dade5a7ee4cb456204fd14c7bc4d244176546bc7f38ad82dea5a
        88c4b78d2f90619e241c57d3fbd1c207 
        ```

4. Now let Bob decrypt the image using the tuple `(IV, key)`:

    ```source
    $ MSG_KEY=7bf3822c42e0dade5a7ee4cb456204fd14c7bc4d244176546bc7f38ad82dea5a

    $ IV_KEY=88c4b78d2f90619e241c57d3fbd1c207

    $ openssl enc -aes-256-cbc -d -in encrypted_img.txt -out decrypted_img.jpg -K $MSG_KEY -iv $IV_KEY
    ```

5. Finally, make sure that the image can be properly seen in Bob's image viewer.


## Exercise 2

**Take the same image as before and try to make Alice to sign it.**

Once again, the image is too large. We need to find an alternative way to sign the image. One simple approach, is to use the `openssl dgst` utility to sign the image. When signing, it is important to achieve both **integrity** and **authentication**, i.e., Bob has to verify that the image was sent by Alice and make sure that the image has not been modified.

1. In Alice, sign the image using the following command:

    ```source
    openssl dgst -sha256 -sign privA.pem -out signed_img img_to_enc.jpg
    ```

2. Send the image and the signature to Bob.

    ```source
    scp signed_img kali@10.0.2.15:/home/kali
    scp img_to_enc.jpg kali@10.0.2.15:/home/kali
    ```

3. Now, in Bob, verify the signature and integrity of the image by using Alice's public key:

    ```source
    $ openssl dgst -sha256 -verify pubA.pem -signature signed_img img_to_enc.jpg

    Verified OK
    ```
