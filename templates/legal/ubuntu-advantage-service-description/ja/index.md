---
wrapper_template: "_base_legal_markdown_ja.html"
context:
     title: "Ubuntu Advantage サービス範囲"
     description: How to get Ceph deployed and related to Kubernetes in order to have a default storage class. This allows for easy storage allocation.
---


# Ubuntu Advantage サービス範囲

<h2 id="uasd-ua-infrastructure">Ubuntu Advantage for Infrastructure (UA-I)</h2>

{% include "shared/pricing/_ua-for-infrastructure-ja.html" %}

<div class="p-top"><a href="#" class="p-top__link">Back to top</a></div>

<h2 id="uasd-subscription">サブスクリプション</h2>

Ubuntu Advantage for Infrastructureをご利用のお客様には、ご自分のサブスクリプションに付属するノードに対して、以下のメリットやサービスを受ける権利があります。

サポート対象ハイパーバイザーを稼動させる物理ホストにUbuntu Advantageのサブスクリプションを接続すると、そのホスト上のすべてのUbuntuゲストに対して同一のサービスが提供されます。

1. セルフサービス方式のカスタマーケアポータルおよびナレッジベース：ナレッジベースへのアクセス権限は、必要なすべての人員に幅広く与えられます。指定された一定数の人員には、問題のサポートを依頼する権限も与えられます。
2. ランドスケープ管理：ランドスケープSAASシステムの管理は、記載された例外を除く全サポートサービスに含まれます。指定人員用のロールベースアクセス制御 （RBAC） も、ご自由にコントロール可能となります。
3. カーネルライブパッチ （Kernel Livepatch） サービス
  1. カーネルライブパッチサービスには、Canonicalのカーネルライブパッチデーモンの使用許諾ライセンス、利用可能なカーネルライブパッチへのアクセス権限およびサービスに関するサポートが含まれます。
  2. カーネルライブパッチサービスは、重大度レベルが「高」および「クリティカル」であるカーネルCVE（共通脆弱性・曝露）の一部について、セキュリティライブパッチを提供します。CVEの一部は、ライブパッチングシステム内の技術的限界その他の理由により、ライブパッチングに適格でない可能性があります。
  3. カーネルライブパッチサービスでは、セキュリティ問題以外のカーネルのバグ修正をカーネルライブパッチとして提供することがあります。
  4. 特定のカーネルバージョンについて、ライブパッチを無期限に提供することは保証しません。  
  5. ライブパッチの適用対象となるのは、デフォルトのLTSカーネルのみです。これには、前回のLTSリリースに対する最終版HWEカーネルによるバックポートも含まれます。
4. 拡張セキュリティメンテナンス
  1. 拡張セキュリティメンテナンスは、複数のサーバーパッケージについて、重大度レベルが「高」および「クリティカル」であるCVEで適用可能なものに修正を提供します。一定のリリースに対する拡張セキュリティメンテナンスの対象となる全パッケージのリストは、以下のページでご覧ください。
  2. 拡張セキュリティメンテナンスは、64-bit x86 AMD/Intelインストールのみに対して提供されます。
  3. 以下の項目は、拡張セキュリティメンテナンスでは提供しません。
    1. 拡張セキュリティメンテナンスのセキュリティアップデートによって生じたバグを除くバグ修正
    2. メンテナンス対象パッケージリストに記載のないパッケージ用のセキュリティ修正
    3. 重大度レベルが「高」および「クリティカル」でないCVEのセキュリティ修正
  4. 拡張セキュリティメンテナンスは、重大度レベルが「高」および「クリティカル」であるすべてのCVEに対する安全なソフトウェアや修正を保証するものではありません。
5. FIPS認証済暗号モジュール
  1. Intel x86\_64、IBM POWER8およびIBM Zの一定のハードウェア上でUbuntuと一緒に使用する場合、FIPS 140-2レベル1基準への適合に十分なパッケージへのアクセス（利用可能な場合）
  2. そのようなパッケージのライセンスで、オープンソースソフトウェアライセンスによりすでに使用を許諾された範囲外のもの
6. 共通基準
  1. Intel x86\_64、IBM POWER8およびIBM Zの一部ハードウェア上でUbuntuと一緒に使用する場合、共通基準EAL（評価保証レベル）2への適合に十分なパッケージおよびスクリプトへのアクセス（利用可能な場合）
  2. そのようなパッケージのライセンスで、オープンソースソフトウェアライセンスによりすでに使用を許諾された範囲外のもの

<div class="p-top"><a href="#" class="p-top__link">Back to top</a></div>

<h2 id="uasd-support-levels">サポートレベル</h2>

Ubuntu Advantage for Infrastructure StandardまたはUbuntu Advantage for Infrastructure Advancedをご利用のお客様には、上記「サブスクリプション」の項に記載したメリットおよびサービスに加え、以下のメリットおよびサービスを受ける権利があります。
1. 週5日・24時間（Standard）または連日24時間（Advanced）対応の電話・チケットによるサポート
  1. 各リリース：Canonicalは、公式ソースを使用して製品ライフサイクル中にインストールされるUbuntuのすべての標準リリースについて、インストール、設定、メンテナンスおよび管理のサポートを提供し、これには該当するすべての拡張セキュリティメンテナンス条件が含まれます。Ubuntuの各バージョンのライフサイクルについては、以下をご覧ください。
  2. ハードウェア：Ubuntu認定ハードウェアは、Canonicalの広範囲にわたるテスト、レビュープロセスに合格したものです。Ubuntuの認定プロセスに関するさらに詳しい情報および認定ハードウェアのリストは、以下の「Ubuntu認定（Ubuntu Certification）」のページでご覧いただけます。本サービスは、お客様のUbuntu認定ハードウェアのみに適用されます。お客様から、認定外のハードウェアに関するサービスの依頼を受けた場合、Canonicalでは相当の努力を払ってサポートサービスの提供に努めますが、本サービス記述書に記載された義務に沿わない場合があります。
  3. パッケージ：本サービスは、以下の項目に適用されます。
    1. 「proposed（提案中）」および「backports（バックポート）」リポジトリポケットを含むUbuntuメインリポジトリ内のパッケージ
    2. Ubuntuクラウドアーカイブ内のパッケージ
    3. CanonicalがメンテナンスするUniverseリポジトリ内のパッケージ
    4. CanonicalがメンテナンスするSnapパッケージおよびチャーム
    5. 本サービスは、サポート対象バージョンをもとに改変されたパッケージには一切適用されません。
  4. カーネル
    1. Ubuntuの長期サポートバージョン（LTS）リリースにより、当初提供されたカーネルは、そのLTSのライフサイクル全体を通してサポート対象となります。
    2. Canonicalでは、LTSの1バージョンの標準サポート期間中にHWE（ハードウェア有効化）カーネルをリリースし、1つのLTSリリース中新たに登場するハードウェアに対してサポートを提供します。HWEカーネルは、次回のLTSポイントリリース時までサポート対象となります。
    3. カーネルのサポートについてさらに詳しくは、をご覧ください。
    4. Canonicalライブパッチサービスへのアクセスは、記載された例外を除く全サポートサービスに含まれます。
  5. ランドスケープ：ランドスケープ全製品は、ランドスケープオンプレミス（購入された場合）を含め、完全サポートの対象となります。
2. OpenStackおよびKubernetesのサポート：Canonicalは、以下に規定するサポートを提供します。
  1. OpenStackに関するサポート
    1. OpenStackソフトウェアのサポートは、基盤となるノード上にデプロイされたUbuntuのリリースによって異なります。
      1. Ubuntuの長期サポートバージョン（LTS）のリリースにより、当初提供されたOpenStackのバージョンは、そのUbuntuバージョンのライフサイクル全体を通してサポートされます。
      2. UbuntuのLTSバージョンのリリース後にリリースされるOpenStackの各リリースは、Ubuntuクラウドアーカイブから入手可能です。Ubuntuクラウドアーカイブ内のOpenStackの各リリースは、Ubuntu LTSの1バージョン上で、該当するOpenStackのバージョンを含むUbuntuバージョンのリリース日から最低18カ月間サポートされます。
      3. OpenStackリリースのサポートスケジュールは、こちらからご覧ください。  
    2. OpenStackサポートには、OpenStackクラウドに参加するすべてのノードが有効なサポート契約の対象であることが必要です。
    3. フルスタック（Full Stack）サポート要件：
      1. 上記の要件に加え、ハードウェアはCharmed（チャーム利用）OpenStackの最低基準を満たしていることが必要です。
      2. OpenStackクラウドは、Private Cloud Build（プライベートクラウドビルド）によりデプロイされたもの、またはCloud Validation（クラウド検証）を依頼して妥当性を確認したものであること
      3. フルスタック（Full Stack）サポートには、以下の項目が含まれます。
        1. デプロイしたチャームに対するサポート
        2. Canonicalとの契約に従って実施するすべてのデプロイメントについて、結果的にチャームがカスタマイズされる場合のカスタマイゼーションは、カスタマイズを含むチャームの公式リリース後90日間有効です。
        3. デプロイされたままの状態でOpenStackを実行するために必要なすべてのパッケージに関するサポートが含まれます。
        4. OpenStackのコンポーネントについて、Ubuntu LTSの定期メンテナンスサイクルの一環としてのアップグレード
        5. OpenStackのバージョン間のアップグレード（例：OpenStack NewtonからMitakaへ）またはUbuntu、JujuおよびMAASのLTSバージョン間のアップグレード（例：Ubuntu 14.04 LTSからUbuntu 16.04 LTSへ）は、サポート対象です。ただし、そのアップグレードは、Canonicalの指定どおり文書化されたプロセスに従い、Private Cloud BuildまたはCloud Validation（クラウド検証）パッケージの一環として行うことを条件とします。
        6. 新しいクラウドノードの追加ならびに既存のノードと同等容量の新しいノードとの交換は、いずれもサポート対象です。
        7. 有効なカスタマイズと見なされないカスタマイゼーションは、フルスタックサポートの対象外です。
      4. Private Cloud Buildによりデプロイされるか、Cloud Validationパッケージで検証された以外のOpenStackクラウドのサポートは、バグ修正サポートのみに限定されます。
      5. OpenStackサポートには、OpenStackクラウドのデプロイ中または設定中のバグ修正サポートを上回るサポートは含まれません。
      6. チャームについて：
        1. チャームの各バージョンは、リリース日から1年間サポート対象となります。
        2. Canonicalでは、[https://wiki.ubuntu.com/OpenStack/OpenStackCharms](https://www.google.com/url?q=https://wiki.ubuntu.com/OpenStack/OpenStackCharms&sa=D&ust=1560426908454000)のページに記載するサポート対象バージョンをもとに改変されたチャームのサポートは一切行いません。
      7. Canonicalでは、OpenStackクラスタにエクスポーズしたCephまたはSwiftストレージのあるノード1つにつき、12TBの使用可能ストレージ容量のサポートを提供します。この容量は、Ceph、Swiftまたはこの両方の組み合わせに利用可能です。このノード数が、対応するOpenStackクラスタ内のコンピュートノード数を上回る場合、サポート対象となるCephおよびSwiftストレージは、クラスタ内のコンピュートノード1つにつき12TBに制限されます。
      8. Ubuntu Advantage OpenStackには、Canonicalの提供する利用可能なMicrosoft認定ドライバをWindowsゲストのインスタンスで使用するライセンスが含まれています。
      9. OpenStackのサポートには、以下は含まれません。
        1. OpenStackのデプロイメント実行に必要な作業負荷以外に関するサポート
        2. クラウドゲスト以外のゲストインスタンスのサポート
  2.  Kubernetesに関するサポート
    1. フルスタック（Full Stack）サポート要件：
      1. Kubernetesのチャーム利用ディストリビューション（CDK）の最小デプロイ設定以上によるデプロイメント、またはCNCFが公表したままの状態で無改変のアップストリーム版Kubernetesバイナリをkubeadmによりデプロイしたクラスタを、Ubuntu上でベースOSとしてデプロイしたもの
      2. CDK参照アーキテクチャ内でチャームを使用するか、同様の方法によりkubeadmを使用してデプロイした高可用性の制御プレーン
      3. サポート対象とするKubernetesクラスタ内のすべてのノードについて、サポートのご購入が必要です。
      4. Kubernetesのサポート対象バージョンには、最新の安定版マイナーリリースおよび安定版リリースチャネルによる直近2回のマイナーリリースが含まれます。さらに詳しくは、[をご覧ください。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908456000)
      5. [Canonicalとの契約に従って実施するKubernetesのチャーム利用ディストリビューションのすべてのデプロイメントについて、結果的にチャームがカスタマイズされる場合のカスタマイゼーションは、そのデプロイメント後90日間サポート対象となります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908457000)
    2. [フルスタックサポート要件が満たされない限り、サポートは以下の項目に限定されます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908457000)
      1. [Kubernetesのチャーム利用ディストリビューションを稼働するために必要なソフトウェアパッケージおよびチャーム](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908457000)
      2. [apt.kubernetes.ioから入手可能なソフトウェアパッケージおよびkubeadmを使用してデプロイしたKubernetesクラスタ](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908458000)
      3. [Canonicalが提供するソフトウェア成果物によるバグ修正サポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908458000)
3. [Ubuntuの法的保証プログラム：利用規約に従うことを条件として、お客様にはUbuntu保証プログラムに加入する権利があります。Canonicalでは、この保証プログラムとその規約を定期的に更新することがあります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908459000)[現行のUbuntu保証プログラムおよびIP免責条項は、Canonicalの「Ubuntu保証」のページでご覧いただけます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908459000)

* * *

## [マネージドサービス](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908461000)

1.  [概要：マネージドサービスは、Ubuntu Advantage for Infrastructure Advancedへのアドオンです。アドオンが行われると、Canonicalは以下の形でEnvironmentを管理し、この環境で運用しているゲストは、Ubuntu Advantage for Infrastructureのサブスクリプションとサポートを受け取ります。クラウド環境の場合、マネージドサービスは“BootStack”と](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908461000)[言及](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908462000)[されます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908462000)
2.  [サービスの開始：Canonicalの構築とEnvironmentの初期化を受けて（独自のサービス取組みの対象）、マネージドサービスはEnvironmentを再デプロイして認証情報をリセットし、デプロイメントプロセスを承認します。マネージドサービスは文書も提供し、Canonicalとの作業関係に関する詳細情報を提供します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908462000)
3.  [運用：マネージドサービスはリモートでEnvironmentを運用、モニタリングおよび管理し、その例としては以下のものが含まれます: (i) 管理インフラスイートのバックアップおよび回復、(ii) ハードウェアおよびソフトウェアのエラーモニタリングと警告、そして (iii) 性能とパフォーマンスの報告](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908463000)

1.  [パッチ提供と更新：マネージドサービスは、該当する（例えばセキュリティ）のパッチとUbuntuクラウドアーカイブからの更新を、以下のものにインストールします:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908463000)

1.  [Ubuntuオペレーティングシステム](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908463000)
2.  [OpenStackまたはKubernetesとその依存部分](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908464000)
3.  [OpenStackまたはKubernetesチャーム](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908464000)
4.  [Environmentの一部としてデプロイされたその他ソフトウェア](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908464000)

2.  [管理アクセス：マネージドサービスは、顧客に以下のアプリケーションおよび/またはサービスへのアクセスを提供します:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908465000)

1.  [OpenStackまたはKubernetesのダッシュボード、APIおよびCLI](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908465000)
2.  [ランドスケープ（読み込みアクセスのみに制限）](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908465000)
3.  [モニタリングとロギングシステム（読み込みアクセスのみに制限）](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908466000)
4.  [Canonicalのみが、Environmentノードへのログインアクセスを持つことになります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908466000)

3.  [Environmentサイズ：Environmentが最小サイズ要件未満にならないという条件において、マネージドサービスは、サポートチケットを通じた顧客からのリクエストに応じてEnvironmentからノードを追加または削除します。Environmentノードは全てこのサービス内でカバーされなければならないため、追加費用が発生する場合があります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908467000)
4.  [Ubuntu、OpenStackおよびKubernetesのアップグレード：マネージドサービスは、顧客のEnvironmentがUbuntuやOpenStackおよび/またはKubernetesのサポート対象バージョンであり続けることを保証します。ほとんどの場合Canonicalは、該当する場合にのみ LTSのリリースに、または顧客との合意に応じて特定のリリースにアップグレードします。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908467000)

4.  [範囲外：以下のものは、マネージドサービスでは提供されません:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908467000)

1.  [ゲストインスタンスまたはコンテナインスタンスに関連するもの](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908468000)

1.  [ゲストインスタンスまたはコンテナインスタンス内で運用されるオペレーティングシステムまたはアプリケーションの管理](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908468000)
2.  [ゲストインスタンスまたはコンテナインスタンスのモニタリング](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908468000)
3.  [ゲストインスタンスまたはコンテナインスタンス内で顧客が作成したデータ（起動しているあらゆるアプリケーションまたはデータベースなど）のバックアップまたはリカバリ](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908469000)
4.  [Caninocalが提供する以外の画像を使用して、ゲストインスタンスを起動する能力のサポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908469000)

2.  [Environmentのアーキテクチャへの変更](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908469000)
3.  [更新やアップグレード日の変更](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908470000)
4.  [該当するUbuntuメインレポジトリ以外のパッケージおよびソフトウェアのインストール、またはUbuntuクラウドアーカイブに提供されたパッケージの更新](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908470000)
5.  [Ubuntu、OpenStackまたはKubernetesのサポート対象バージョンは、5年間の「一般」リリース枠内でなければなりません。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908470000)
6.  [Environmentの構築の一部としてインストールされたソフトウェア以外の追加コンポーネント（例: LBaaS、VPNaaS、SDNまたはSDS）のインストール](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908471000)

5.  [サービスの](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908471000)[満期：マネージドサービスは、サービス期間の満期時に運用の移転を開始します。運用の移転には以下のものが含まれます:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908471000)

1.  [顧客への、ホストと管理ソフトウェアの認証情報全ての引き渡し](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908472000)
2.  [ランドスケープの管理認証情報の引き渡し（ランドスケープの継続した運用は、適切なライセンス条件の購入および合意によります）](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908472000)
3.  [該当する研修の調整（購入した場合）](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908473000)

6.  [サービス提供条件：マネージドサービスは、以下のものを要求します:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908473000)

1.  [EnvironmentへのCanonicalサポート人員向けの継続的なVPNアクセス](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908473000)
2.  [ノードごとのパラメータの使用は、Environmentが顧客に引き渡されるときにCanonicalが提供する設計文書の中で特定される最大未満に維持する](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908474000)
3.  [Environmentがホストされている施設が最低限要求された機能措置を遵守していること。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908474000)[接続性、十分な電力供給、十分な冷却システムおよびEnvironmentへの物理的アクセスの管理が含まれるがこれに限定されない](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908474000)
4.  [クラウドまたはクラスタ向けの最小サイズ要件が常に満たされていること](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908475000)

7.  [アップタイムサービスレベル](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908475000)

1.  [マネージドサービスは、以下のアップタイムサービスレベルを含みます:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908476000)

[2つの地域の間で配分される顧客業務量向けデータプレーン](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908477000)

[単一地域の中の顧客業務量向けデータプレーン](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908478000)

[管理水準（OpenStack/Kubernetes API、ウェブUIおよびCLI）](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908478000)

[アップタイム](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908479000)

[99.9%](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908479000)

[99.5%](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908480000)

[99%](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908481000)

2.  [データプレーンには以下のものが含まれます:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908481000)

1.  [仮想化（単一のコンピュートノードに依存しないようアーキテクチャが組まれた業務量向け）](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908482000)
2.  [ストレージ（ブロックおよびオブジェクト）](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908482000)
3.  [インスタンス向けネットワーク](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908482000)

3.  [サービスレベルに対してダウンタイムが計算されるには、Canonicalに直接起因するものでなければならず、12ヶ月の期間を通じて計測されます。予定済みメンテナンスウインドウおよび顧客からのいかなるリクエストも、アップタイムの計算の際には考慮されません。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908483000)
    
    * * *
    

## [仮想マシンとクラウドインスタンス](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908483000)

1.  [Ubuntu Advantage for Infrastructure, Virtualサービスは、該当する Ubuntu Advantage for Infrastructureの提供内容に合致し、以下に記載された例外事項の対象となります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908484000)
2.  [Ubuntu Advantage Infrastructure, Virtualサービスは、インストースされるとUbuntuサーバ向けに提供され、(1) Ubuntu認証済みパブリッククラウドパートナーの環境内において、または(2) ゲストがCovered Hypervisor上で運用しているという条件下で物理的ホスト上で、仮想化した環境内のゲストとして運用されます。  
      
    注: 基盤技術のみが一覧表示されます。これらは、OpenStackのようなクラウド経由で提供可能です。ハイパーバイザのベンダーがUbuntuのサポート対象バージョンの特定一覧を提供する場合、これらバージョンのみがUbuntu Advantage for Infrastructure, Virtualサービスで利用可能となります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908484000)
3.  [認証済みパブリッククラウドのパートナーは、Ubuntuのパートナー一覧でご覧になれます:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908484000)
4.  [Kubernetesのサポートは、上記のUbuntu Advantage for Infrastructureのアプリケーションセクションの規定として含まれています。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908485000)
5.  [Ubuntu Advantage for Infrastructure, Virtualサービスは、以下のものは提供しません:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908485000)

1.  [Hypervisorサポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908485000)
2.  [OpenStackサポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908486000)
3.  [MAASサポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908486000)
4.  [選択済みのハイパーバイザ向けにネイティブイメージを提供](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908486000)
5.  [追加の除外事項は、該当するUbuntu Advantage for Infrastructureサービス提供のものに合致します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908487000)
    
    * * *
    

## [デスクトップサポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908487000)

1.  [デスクトップサポートサービスは、以下に記載された例外事項の対象となっています。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908488000)
2.  [対象範囲：デスクトップサポートは、基本ネットワーク認証に必要なUbuntuデスクトップISO内のパッケージすべてと、sssd、winbind、ネットワークマネージャおよびUbuntuメインレポジトリ内のネットワークマネージャプラグインを用いた接続に必要なパッケージをカバーしています。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908488000)
3.  [対象外](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908488000)

1.  [デュアルブート（その他のオペレーティングシステムと共生する）](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908489000)
2.  [Ubuntu上の動作が認証されていない周辺機器](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908489000)
3.  [Ubuntuの](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908489000)[コミュニティフレーバー](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908490000)
4.  [x86\_64以外のアーキテクチャへのサポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908490000)

* * *

## [アドオン](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908492000)

[アドオンは、各ノード基盤で別々に利用可能な追加サポートサービスを構成し、下層ノードが適切なUbuntu Advantageサポートによりカバーされていることが必要です。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908493000)

1.  [Rancherサポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908493000)

1.  [要件: ノードは、Ubuntu Advantage for Infrastructureによりカバーされていなければなりません。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908493000)
2.  [Rancherサポートは、Kubernetesのチャームドディストリビューションを管理しているときにRancher Labsが刊行した互換性マトリクスとサポートライフサイクルに従い、Rancher 2.xの使用に関して故障修理サポートおよび基本的な質問への回答を提供します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908494000)
3.  [Rancherサポートは、以下のものは提供しません:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908494000)

1.  [Rancher 1.xからRancher 2.xへのマイグレーション作業](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908494000)
2.  [Rancherへの第三者アドオンへのサポートおよび基本的な質問への回答](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908495000)
3.  [Rancherのインストール](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908495000)

2.  [Trilioサポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908495000)

1.  [要件: ノードはUA for Infrastructureでカバーされていなければなりません。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908496000)
2.  [Trilioサポートは、Trilio Data, Inc.が刊行した互換性マトリクスとサポートライフサイクルに従い、Trilioの使用に関して故障修理サポートおよび基本的な質問への回答を提供します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908496000)
3.  [Trilioサポートでは、以下のものは提供されません:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908497000)

1.  [Trilioバージョン間での作業量のマイグレーション](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908497000)
2.  [Trilioへの第三者アドオンへのサポートおよび基本的な質問への回答](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908497000)
3.  [Trilioのインストール](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908498000)

3.  [ストレージサポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908498000)

1.  [Ubuntu Advantage for Infrastructureには、ノードごとに利用可能なストレージ向け割当量が含まれます。「OpenStack & Kubernetesサポート」セクションをご覧ください。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908498000)
2.  [ノードの割当量を超過した場合、追加ストレージサポートを取得する必要があります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908499000)
3.  [ストレージサポートは、対応する応答回数において提供されます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908499000)
4.  [ストレージサポートは、すべてのストレージプールに保存された合計データ量によって計測され、ギガバイトで表示されます](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908500000)[。これには空き容量や全ての複製、そして消去コーディングオーバーヘッドは除外されています。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908500000)
5.  [ストレージサポートは、CephやSwiftへのサポートに適用されます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908500000)
6.  [容量が無限のストレージサポートを購入した顧客は、単一のCephクラスタまたはSwiftクラスタ内でのサポートに限定されます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908501000)

* * *

## [MAASサポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908502000)

1.  [サポートの対象：MAASサポートの資格を得るためには、MAASリージョンコントローラに接続されたUbuntuのノードは全てUbuntu Advantage for Infrastructureの下でカバーされ、Ubuntuではないノードは全て、MAASの下でカバーされていなければなりません。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908502000)

1.  [UA-Iは、MAAS向けサポートを含みます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908503000)
2.  [MAASサポートの対象資格を維持するには、UA-Iの下でカバーされていないノード全てに対してMAASを購入する必要があります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908503000)

2.  [含まれているサポート：MAASは以下のものを提供します:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908504000)

1.  [Canonicalが提供するオペレーティングシステムイメージを使って、マシンを起動する能力のサポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908504000)
2.  [Canonicalにより提供されていない認証済みオペレーティングシステムイメージをMAASのイメージに変換するのに必要なツールのサポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908505000)
3.  [MAAS Image Builderを使用するライセンス](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908505000)

3.  [対象外：MAASでは以下のものは提供されません:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908505000)

1.  [MAASのデプロイメントの実行に必要なもの以外の業務量、パッケージおよびサービスコンポーネントへのサポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908506000)
2.  [MAASを使ってデプロイされたノード向けサポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908506000)
3.  [MAASデプロイメントの設計と導入の詳細サポート](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908506000)
4.  [MAASとともにデプロイされた機械向けのLandscapeとCanonical Livepatch Serviceへのアクセス](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908507000)

4.  [バージョン：MAASのバージョンは、Ubuntuアーカイブからリリースされた日から1年間、UbuntuのLTSバージョン上でサポートされます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908507000)

* * *

# [ソフトウェア](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908508000)

1.  [ランドスケープ・オンプレミス](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908508000)

1.  [ランドスケープ・オンプレミスのサポートは、Ubuntu Advantage for Infrastructureに含まれています。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908508000)
2.  [ランドスケープ・オンプレミスサービスには、以下のものが含まれています:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908509000)

1.  [ランドスケープ・オンプレミスのシングルインスタンスをダウンロードおよびインストールするライセンス](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908509000)
2.  [Ubuntu Advantageサービスを顧客が購入したマシン（物理的または仮想的を問わず）向けに、ランドスケープ・オンプレミスの管理やモニタリングサービスを使う能力](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908510000)
3.  [デプロイメントの方法:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908510000)

1.  [「クイックスタート」インストール手法を使ってインストールする場合、ランドスケープ・オンプレミスがインストールされているマシン向けのサポートが含まれています。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908510000)
2.  [手動インストール手法を使ってインストールする場合、ランドスケープ・オンプレミスがインストールされているサーバ2つまでのサポートが含まれています。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908511000)
3.  [Jujuを使ってデプロイする場合、「濃密デプロイメント」手法がサポートされます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908511000)

2.  [ライブパッチ・オンプレミス](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908511000)

1.  [ライブパッチ・オンプレミスのサポートは、Ubuntu Advantage for Infrastructureに含まれています。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908512000)
2.  [サービスは、ライブパッチ・オンプレミスのシングルインスタンスのダウンロードおよびインストールのライセンスを提供します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908512000)

* * *

# [プロフェッショナルサポートサービス](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908513000)

1.  [テクニカルアカウントマネージャ （TAM）](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908513000)

1.  [Canonicalは、サービス期間中、週当たり最大10時間のサービスを実施するTAMの提供により、サポートを強化します:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908514000)

1.  [該当するUbuntu Advantageサービスでカバーされるプラットフォームおよび設定についてサポートと最善例のアドバイスを提供](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908514000)
2.  [相互合意した回数の顧客の運用上の問題に対処する隔週のレビューコールに参加](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908514000)
3.  [該当する場合、TSANet またはCanonicalの直接提携を通じてマルチベンダー問題を調整。根本原因が特定されたら、TAM はサブシステムのベンダーと協力し、その通常のサポートシステムを通じて問題を解決すべく業務を実施](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908515000)

2.  [サービスパフォーマンスを査定し、改善の余地のある部分を特定すべく、Canonicalは四半期ごとにサービスレビュー会議を顧客と行います。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908515000)
3.  [TAMは顧客の現場を毎年訪れ、オンサイトのテクニカルレビューを行います。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908515000)
4.  [TAMは、TAMの業務時間中に事例サポートの対応が可能です。業務時間外は、Ubuntu Advantage Support Processを通じてサポートが提供されます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908516000)

2.  [専任テクニカルアカウントマネージャ（DTAM）](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908516000)

1.  [Canonicalは、サービス期間中の現地業務時間中（Canonicalの休暇ポリシーによる）、最大で週当たり40時間、以下のサービスを実施する DTAMを提供してサポートを拡充します:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908517000)

1.  [該当するUbuntu Advantageサービスでカバーされるプラットフォームおよび設定について、サポートと最善例のアドバイスを提供](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908517000)
2.  [DTAMが担当する顧客対応部門から発生するサポートリクエスト全てに対して、最初の連絡先として機能](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908517000)
3.  [Canonicalの標準サポート対応の規定および顧客のニーズに従って、サポートの格上げと優先化を管理](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908518000)
4.  [顧客の運営上の問題に対処する定期的なレビューコールに参加](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908518000)
5.  [該当する場合、TSANet またはCanonicalの直接提携を通じてマルチベンダー問題を調整。根本原因が特定されたら、DTAM はサブシステムのベンダーと協力し、通常サポートシステムを通じて問題を解決すべく業務を実施](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908519000)
6.  [該当するCanonicalの内部研修および能力開発活動に参加（直接、およびリモートで）](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908519000)

2.  [サービスパフォーマンスを査定し、改善の余地のある部分を特定すべく、Canonicalは四半期ごとにサービスレビュー会議を顧客と行います。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908519000)
3.  [DTAMは、DTAMの業務時間中に事例サポートの対応が可能です。業務時間外は、Ubuntu Advantage Support Processを通じてサポートが提供されます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908520000)
4.  [DTAMが5営業日を超えて休暇を取る場合、Canonicalは当人の休暇期間をカバーすべく、一時的にリモート人材を割り当てます。Canonicalは、予見可能なDTAMの休暇に関して顧客と調整を行います。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908520000)

3.  [専任サポートエンジニア（DSE）](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908521000)

1.  [Canonicalは、サービス期間中の現地業務時間中（Canonicalの休暇ポリシーによる）、最大で週当たり40時間、以下のサービスを実施する DSEを提供してサポートを拡充します:](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908521000)

1.  [顧客の要件に対応すべく、要求に応じてオンサイトで待機。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908521000)
2.  [顧客の環境内で使用され、Canonicalの提供内容への統合が必要な製品を理解し、Canonicalからの提供商品がきちんと使用されることを保証すべく、かかる製品に対して最高の支援を提供](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908522000)
3.  [該当するUbuntu Advantageサービスでカバーされるプラットフォームおよび設定について、サポートと最善例のアドバイスを提供](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908522000)
4.  [DSEが担当する顧客対応部門から発生するサポートリクエスト全てに対して、最初の連絡先として機能](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908523000)
5.  [Canonicalの標準サポート対応の規定および顧客のニーズに従って、サポートの格上げと優先化を管理](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908523000)
6.  [顧客の運営上の問題に対処する定期的なレビューコールに参加](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908523000)
7.  [該当する場合、TSANet またはCanonicalの直接提携を通じてマルチベンダー問題を調整。根本原因が特定されたら、DSE はサブシステムのベンダーと協力し、通常サポートシステムを通じて問題を解決すべく業務を実施](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908524000)
8.  [該当するCanonicalの内部研修および能力開発活動に参加（直接、およびリモートで）](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908524000)

2.  [サービスパフォーマンスを査定し、改善の余地のある部分を特定すべく、Canonicalは四半期ごとにサービスレビュー会議を顧客と行います。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908525000)
3.  [DSEは、DSEの業務時間中に事例サポートの対応が可能です。業務時間外は、Ubuntu Advantage Support Processを通じてサポートが提供されます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908525000)
4.  [DSEが5営業日を超えて休暇を取る場合、Canonicalは当人の休暇期間をカバーすべく、一時的にリモート人材を割り当てます。Canonicalは、予見可能なDSEの休暇に関して顧客と調整を行います。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908526000)

* * *

# [Ubuntuアドバンテージのサポートサービス](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908526000)

# [プロセス](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908527000)

1.  [サービス開始](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908528000)

1.  [サービスの開始時に、Canonicalはランドスケープ、サポートポータル、およびオンラインナレッジベースの技術担当者一名へのアクセスを提供します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908528000)
2.  [お客様は、当初の技術担当者を通じて、サポート対象のシステムの数に基づいてCanonicalと連携するために、以下の表に示されているように技術担当者を選択することができます。これらの技術担当者は、サポートポータルへの資格を保持し、サポートをリクエストする際の主な窓口となります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908528000)

[Ubuntuアドバンテージサポート対象のマシン数](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908529000)

[技術担当者](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908530000)

[1〜20](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908531000)

[2](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908531000)

[21〜50](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908532000)

[3](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908533000)

[51〜250](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908533000)

[6](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908534000)

[251〜1000](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908535000)

[9](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908535000)

[1001〜5000](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908536000)

[12](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908537000)

[5001以上](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908537000)

[15](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908538000)

3.  [お客様は、サポートポータルを介してサポートリクエストを送信することにより、いつでも指定する技術担当者を変更できます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908539000)

2.  [サポートリクエストを送信する](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908539000)

1.  [顧客アカウントがサポートポータル内でプロビジョニングされると、顧客はサポートリクエストをオープンすることができます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908540000)
2.  [特に明記されていない限り、顧客はサポートポータルを通じて、または電話でサポートチームに連絡することによってサポートケースを提出できます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908540000)
3.  [サポートケースは、単一の個別の問題、争点、またはリクエストで構成されている必要があります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908541000)
4.  [ケースにはチケット番号が割り当てられ、自動的に応答されます。電子メールや電話などケースに直接入力されないすべての通信は、品質保証のためのタイムスタンプ付きでケースにログインされます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908541000)
5.  [ケースを報告する際は、Canonicalが適切な重大度レベルを決定するためにその影響度を報告してください。複数のサポートを同時にリクエストされるお客様には、ビジネスへの影響の深刻度に応じてケースの優先順位付けをお願いすることがあります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908541000)
6.  [ケースの解決に向けて、Canonicalから要求されるすべての情報の提供をお願いしています。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908542000)
7.  [Canonicalはサポートポータル内に各案件の記録を保存し、お客様が現在のすべての案件をトラッキングしそれに対応し、過去の案件をレビューできるようにしています。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908542000)

3.  [サポートの重大度](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908542000)

1.  [サポート依頼が開始されると、Canonicalサポートエンジニアがケース情報を検証して重大度を判断し、お客様と協力してケースの緊急性を評価します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908543000)
2.  [対応時間は、該当するサービス提供の説明に記載されています。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908543000)
3.  [重大度を設定する際に、Canonicalのサポートチームは以下の定義を使用します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908544000)

[重大度レベル1](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908545000)

[コア機能が利用できない場合](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908546000)

[Canonicalは、適切なサポートエンジニアおよび/または開発エンジニアを通じて、購入したサービスレベルに応じて継続的な努力を払い、回避策または恒久的な解決策を提供します。コア機能が利用可能になるとすぐに、適切な重大度レベルに引き下げられます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908546000)

[重大度レベル2](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908547000)

[コア機能が著しく低下した場合](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908547000)

[Canonicalは、該当する営業時間内に回避策または恒久的な解決策をお客様に提供するために協力します。コア機能の低下がある程度回復した場合、重大度レベルはレベル3に下げられます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908548000)

[重大度レベル3](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908549000)

[標準サポートが依頼された場合](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908549000)

[Canonicalは、適用する営業時間内に合理的な努力を払い、可能な限り早く回避策または恒久的な解決策を提供します。回避策が提供された場合、Canonicalのサポートエンジニアは、この問題に対する恒久的な解決策の開発に取り組みます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908550000)

[重大度レベル4](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908551000)

[緊急以外の要請の場合](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908551000)

[レベル4の要請には、表面的な問題、情報の要請、機能の要請、および同様の問題が含まれます。Canonicalは、機能要求への対応についてのスケジュールまたは保証を提供しません。Canonicalは、各レベル4のケースを確認し、それが将来のリリースにて検討すべき製品強化の問題であるか、現在リリースされているもので修正すべき問題であるか、または将来のリリースで修正すべき問題であるかを判断します。Canonicalは、補償時間内には妥当なレベルの努力を払って情報の要請を確認し、対応します。またCanonicalが適切であると判断した場合には、対応後にレベル4の案件をクローズする場合があります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908552000)

4.  [応答時間：Canonicalは、適用可能なサービスおよび重大度に基づき、下記の回答期間内にお客様からのサポートリクエストに対応するよう、合理的な努力を払います。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908553000)

1.  [応答時間の表](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908553000)

[Standard](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908555000)

[Advanced](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908556000)

[重大度レベル1](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908557000)

[4時間（週末と休日を除く）](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908557000)

[1時間](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908558000)

[重大度レベル2](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908559000)

[8営業時間](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908559000)

[2時間](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908560000)

[重大度レベル3](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908560000)

[12営業時間](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908561000)

[6時間](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908562000)

[重大度レベル4](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908562000)

[24営業時間](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908563000)

[12時間](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908564000)

2.  [解決：Canonicalはサポート案件を解決するために合理的な努力を払いますが、  
    回避策、解決方法、または解決時間の保証はしません。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908564000)

5.  [ホットフィックス：重大なサポート案件を一時的に解決するために、Canonicalはパッチを適用する該当ソフトウェアのバージョン（パッケージなど）を提供する場合があります。このようなバージョンは「ホットフィックス」と呼ばれます。Canonicalが提供するホットフィックスは、対応するパッチがUbuntu 文書 のソフトウェアのリリースに組み込まれてから90日間サポートされます。ただし、パッチが該当するアップストリームプロジェクトによって拒否された場合、ホットフィックスはサポートされなくなり、ケースは未解決のままになります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908565000)
6.  [言語：Canonicalは英語でサポートを提供しますが、特定の時期に他の言語が利用可能になる場合があります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908565000)
7.  [リモートセッション：Canonicalは、リモートアクセスサービスを使用してお客様のサポート対象システムへのアクセスをにアクセスすることを申し出ることがあります。その場合、Canonicalはどのリモートアクセスサービスを使用するかを決定します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908565000)
8.  [Ubuntuのアドバンテージ管理のエスカレーション：サービスに満足されない場合は、その状況をCanonical管理者にエスカレートする方法がいくつかあります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908566000)
9.  [案件終了時のフィードバック：ケースがクローズされると、Canonicalからのサポートに対する総合的な経験について、案件のオーナーにアンケート調査がメールで送信されます。すべてのアンケート調査は経営陣によって見直しされます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908566000)
10.  [ピアレビューの依頼：通常のビジネス手法として、Canonicalはすべての案件の一部に対してピアレビューを行います。お客様は、案件のコメント欄にて、またはサポートポータルに記載されている電話番号に連絡し、ケースに関するピアレビューを要請することができます。案件を見直しフィードバックを提供するために、中立のエンジニアが割り当てられます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908566000)
11.  [管理のエスカレーション：お客様は、エスカレーションプロセスに従ってサポートの問題を上申することができます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908567000)

1.  [緊急ではないニーズ：Case](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908567000)[の中](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908567000)[で管理のエスカレーションを要請してください。1営業日以内にマネージャーに連絡が行き、マネージャーが案件を確認して回答を投稿します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908568000)
2.  [緊急のニーズ](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908568000)

1.  [supportmanager@canonical.comに電子メールを送ってCanonicalのSupport＆Technical Services Managerに上申してください。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908569000)
2.  [さらに上部への上申が必要な場合は、Canonicalのサポート＆テクニカルサービスのディレクターにメールをお送りください（](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908569000)[operations-director@canonical.com](mailto:operations-director@canonical.com)[）。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908569000)

* * *

# [用語の定義](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908570000)

[「バグ修正サポート」は、サポート対象のパッケージでのみ有効なコードバグのサポートを意味します。これには、バグが存在するかどうかを判断するための問題のトラブルシューティングは含まれません。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908571000)

[「営業時間」は、他の場所が合意されていない限り、顧客の本部の近くのロケーションでの休日を除いた月曜日から金曜日の08:00から18:00までを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908571000)

[「Cephクラスタ](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908571000)[」とは、単一の物理的なデータセンター内でのCephインストールを意味し、一意の識別子によって指定されています。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908572000)

[「](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908573000)[Kubernetesの](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908573000)[チャームディストリビューション](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908573000)[」とは、Jujuおよび公式のCanonical-Kubernetes](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908574000)

[ バンドルをベアメタル、クラウドゲスト、または仮想マシンに展開したことを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908574000)

[「チャーム」](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908575000)[とは、ソフトウェアパッケージ間の関係を展開および構成することを目的とした、Jujuアプリケーションモデリングと互換性のある一連のスクリプトを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908575000)

[「クラウド」とは、OpenStackクラウドコンピューティング環境の展開を意味します](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908576000)

[「クラウドゲスト」とは、Ubuntuサーバのゲストインスタンスまたはコンテナインスタンスを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908577000)

[「クラスタ」とは、Kubernetesコンピューティング環境のデプロイメントがCanonicalによって管理](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908577000)[されること](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908578000)[を意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908578000)

[「コンテナインスタンス」とは、クラスタ内で実行されているコンテナインスタンスを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908579000)

[「対象ハイパーバイザー」とは、KVM |Qemu | Bochs、VMWare ESXi、LXD | LXC、Xen、Hyper-V、VirtualBox、z / VM、Dockerのいずれかを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908579000)

[「デプロイメント」とは、](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908579000)[kubeadmを使用し](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908580000)[た](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908580000)[Kubernetesのチャーム](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908580000)[ディストリビューション](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908581000)[またはkubeadmを使用したKubernetesをデプロイするプロセスを意味します。Jujuがすべてのアプリケーションをが「開始」状態にあることを報告すると、デプロイメントは成功したと見なされます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908581000)

[「DSE」とは、1人のお客様のためにフルタイムでサポートするCanonicalの専任サポートエンジニアを意味します。DSEはお客様のサポート組織の延長としての役を務め、お客様の環境内でCanonical製品を統合およびサポートに主眼を置いています。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908582000)

[「DTAM」とは、単一のお客様のために、リモートでフルタイムの作業に専念するCanonicalサポートエンジニアを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908582000)

[「](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908583000)[Environment](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908583000)[」とは、特定のサービス提供に適用するクラウドまたはクラスタを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908584000)

[「フルスタックサポート」とは、ユーザーおよび運用レベルのOpenStackの機能、パフォーマンス、および可用性に関する問題に対処することを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908584000)

[「ゲストインスタンス」とは、クラウド内で実行される仮想マシンインスタンスを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908584000)

[「インフラストラクチャサービス」とは、Canonicalが](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908585000)[Environment](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908585000)[のデプロイメント、管理、監視、および維持に使用するサービスのことで、MAAS、ランドスケープおよびLMAサービスを含みます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908585000)

[「](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908586000)[Kubernetes](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908586000)[」](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908586000)[とは、Canonicalから配布され、「Kubernetes」として知られるコンテナオーケストレーションソフトウェアを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908587000)

[「ランドスケープ・オンプレミス」](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908588000)[とは、お客様のハードウェアにインストールされているCanonicalのLandscapeシステムを管理するソフトウェアを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908588000)

[「ライブパッチ・オンプレミス」](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908589000)[とは、お客様のハードウェアにインストールされたCanonicalのlivepatchリポジトリソフトウェアを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908589000)

[「LMAサービス」とは、ロギング、モニタリング、およびアグリゲーションサービスを意味し、現在はNagios、Prometheus、Alertmanager、Grafana、GraylogおよびElasticsearchが含まれています。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908590000)

[「管理対象ノード」とは、インフラストラクチャサービスを実行するか、またはCanonicalによって実行されるJujuコントローラに管理され、Jujuによって生存していると見なされるノードを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908591000)

[「最小サイズ要件」とは、クラウドに対して継続的に利用可能な少なくとも12台のホストノード、またはクラスタに対して継続的に利用可能な10台のホストノード、またはCanonicalと書面で合意したその他のサイズ要件を意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908591000)

[「ノード」とは、環境を実行する目的で、お客様からCanonicalに提供される（または代金を支払われる）物理ノードまたは仮想マシンを意味します。ノード上に作成されたさらなるマシン（仮想かコンテナーかを問わず）は、それ自体はノードとは見なされません。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908591000)

[「OpenStack」とは、CanonicalからUbuntuとともに配布されている「OpenStack」と呼ばれるクラウドコンピューティングソフトウェアを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908591000)

[「OpenStackパッケージ」とは、UbuntuアーカイブのUbuntuメインリポジトリに存在するOpenStackに関連するパッケージを意味します。これには、Ubuntuクラウドアーカイブで配信されるパッケージの更新も含まれます。これには](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908592000)[以下にリスト](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908592000)[されているチャームが含まれます](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908592000)[https://wiki.ubuntu.com/OpenStack/OpenStackCharms](https://www.google.com/url?q=https://wiki.ubuntu.com/OpenStack/OpenStackCharms&sa=D&ust=1560426908593000)[.](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908593000)[。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908593000)

[「物理ノード」とは、物理コンピューティングインフラストラクチャの単一の名前付き/管理対象ユニット、本質的にはシェルフまたはラックユニットを意味します。複数のCPUソケット、コア、NIC、ストレージコントローラ/デバイスが含まれる場合があります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908594000)

[「パブリッククラウド」とは、第三者（つまりCanonicalおよびお客様以外）がゲストインスタンスまたはコンテナインスタンスを作成および管理できる](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908594000)[Environment](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908595000)[を意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908595000)

[「Rancher」は、Rancher Labsによって公開されているRancherとして知られるソフトウェアを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908595000)

[「](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908596000)[Region](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908596000)[」](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908596000)[とは、通常は](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908596000)[身元](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908597000)[（](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908597000)[キーストーン](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908597000)[）サービスのみを他の](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908598000)[Region](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908598000)[と共有する専用のAPIエンドポイントを持つ個別のOpenStack環境を意味します。OpenStack](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908598000)[ Region](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908598000)[は単一のデータセンター内に含まれている必要があります。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908599000)

[「サポート」とは、故障修理サポートとサポートパッケージに関する基本的な質問に答えることを意味します。Kubernetesの設定と最適化だけでなく、展開とアップグレードの支援もサポートの範囲外です。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908600000)

[「サポートされているKubernetesパッケージ」とは、CanonicalまたはCNCFが適切なパッケージリポジトリを介して配布しているバイナリ形式のKubernetesを含むパッケージを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908600000)

[「サポートパッケージ」とは上記のOpenStackパッケージとKubernetesパッケージの組み合わせを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908601000)

[「](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908602000)[Swift](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908602000)[クラスタ](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908603000)[」](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908603000)[とは、単一の物理データセンターへの単一の](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908603000)[迅速](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908603000)[インストールを意味し、固有の](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908604000)[識別子](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908604000)[で指定されます。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908604000)

[「TAM」とは、お客様のスタッフおよび管理者と個人的に共同作業するためにリモートで働くCanonicalのサポートエンジニアを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908605000)

[「Trilio」とは、Trilio Data、Incが発行しているTrilioと呼ばれるソフトウェアのことです。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908606000)

[「アップグレード」とは、バージョン間でKubernetesをアップグレードするプロセスを意味します。Jujuがすべてのアプリケーションを「開始」状態と報告すると、アップグレードは成功したと見なされます。Canonicalは、アップグレードプロセス中に発生した有効なバグのサポートを提供します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908606000)

[「有効なカスタマイズ」とは、](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908607000)[ホライズン](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908607000)[またはOpenStackパッケージのOpenStack APIを介して行われた設定を意味します。誤解を避けるために付け加えれば、有効なカスタマイズにはCanonicalによって明示的に実行または承認されていないアーキテクチャの変更は含まれません。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908608000)[プライベートクラウドビルド](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908608000)[中に設定された構成オプションは、クラウドの健全性にとって重要であると見なされるべきであり、これらを変更すると、クラウドがサポートされなくなる可能性があります。継続的なサポートを確実に提供するために、変更要求はCanonicalによって検証されなければなりません。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908608000)

[「仮想マシン」とは、認識されているハイパーバイザーテクノロジー（KVM、VMWare ESXi、OpenStack、または](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908609000)[パブリッククラウド](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908610000)[）上でインスタンス化された仮想化コンピューティングインスタンスを意味します。](https://www.google.com/url?q=https://github.com/juju-solutions/bundle-canonical-kubernetes/wiki/Supported-Kubernetes-Versions&sa=D&ust=1560426908610000)